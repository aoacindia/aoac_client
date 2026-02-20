/**
 * Delhivery Shipping Calculation Utilities
 * Handles both standard and heavy shipping calculations
 */

import { getDelhiveryToken } from './delhivery-auth';

const DELHIVERY_STANDARD_API_URL = 'https://track.delhivery.com/api/kinko/v1/invoice/charges';
const DELHIVERY_HEAVY_API_URL = 'https://ltl-clients-api.delhivery.com/freight/estimate';
const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY || '';
const PICKUP_PINCODE = process.env.PICKUP_PINCODE || '211007';

// Weight threshold for using heavy shipping (in grams)
const HEAVY_SHIPPING_THRESHOLD = 10000; // 10kg

interface ShippingRequest {
  delivery_postcode: string;
  totalWeight: number; // in grams
}

interface ShippingResponse {
  status: 'success' | 'error';
  provider: 'delhivery';
  delivery_charges: {
    courier_name: string;
    freight_charge: number;
    estimated_delivery_days?: number | string;
    courier_id?: string;
    isServiceable: boolean;
    message: string;
    zone?: string;
    price_breakup?: Record<string, unknown>;
    charged_weight?: number;
    min_charged_weight?: number;
    raw_response?: unknown;
  };
}

type HeavyShippingResponse = {
  success?: boolean;
  message?: string;
  data?: {
    total?: number;
    price_breakup?: Record<string, unknown>;
    charged_wt?: number;
    min_charged_wt?: number;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Calculate shipping using Delhivery Standard API
 */
export async function calculateDelhiveryShippingStandard(
  body: ShippingRequest
): Promise<ShippingResponse> {
  const { delivery_postcode, totalWeight } = body;
  
  if (!delivery_postcode || !totalWeight) {
    return {
      status: 'error',
      provider: 'delhivery',
      delivery_charges: {
        courier_name: 'Delhivery',
        freight_charge: 0,
        isServiceable: false,
        message: 'Missing required fields',
      },
    };
  }

  try {
    const weightInKg = totalWeight / 1000;
    const weightInGrams = Math.round(weightInKg * 1000);
    
    const params = new URLSearchParams({
      md: 'S',
      ss: 'Delivered',
      d_pin: delivery_postcode,
      o_pin: PICKUP_PINCODE,
      cgm: weightInGrams.toString(),
    });

    const response = await fetch(`${DELHIVERY_STANDARD_API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Token ${DELHIVERY_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = `Delhivery API error: ${response.status}`;
      
      try {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = `Delhivery API returned: ${errorText.substring(0, 100)}...`;
        }
      } catch (parseError) {
        console.error('Failed to parse Delhivery error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      // Parse XML response
      const xmlText = await response.text();
      data = await parseXmlResponse(xmlText);

      if (isRecord(data) && isRecord(data.root)) {
        const listItem = (data.root as Record<string, unknown>)['list-item'];
        const charges = Array.isArray(listItem) ? listItem : [listItem];

        data = charges
          .filter((item): item is Record<string, unknown> => isRecord(item))
          .map((item) => {
            const chargeMpsValue = item['charge_MPS'];
            const chargePickupValue = item['charge_pickup'];
            const zoneValue = item['zone'];

            const chargeMps =
              typeof chargeMpsValue === 'string' || typeof chargeMpsValue === 'number'
                ? String(chargeMpsValue)
                : '0';
            const chargePickup =
              typeof chargePickupValue === 'string' || typeof chargePickupValue === 'number'
                ? String(chargePickupValue)
                : '0';

            return {
              total_amount: parseFloat(chargeMps) + parseFloat(chargePickup),
              zone: typeof zoneValue === 'string' ? zoneValue : 'D',
            };
          });
      } else {
        throw new Error('Invalid XML structure from Delhivery API');
      }
    } else {
      const responseText = await response.text();
      console.log('Unexpected content type from Delhivery API:', responseText);
      throw new Error('Delhivery API returned unexpected response format');
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        status: 'error',
        provider: 'delhivery',
        delivery_charges: {
          courier_name: 'Delhivery',
          freight_charge: 0,
          isServiceable: false,
          message: 'Destination not serviceable',
        },
      };
    }

    const shippingInfo = data[0];
    const totalAmount = shippingInfo.total_amount || 0;
    const zone = shippingInfo.zone;
    
    // Calculate estimated delivery days based on zone
    let estimatedDays = 3;
    if (zone === 'A') estimatedDays = 1;
    else if (zone === 'B') estimatedDays = 2;
    else if (zone === 'C') estimatedDays = 3;
    else if (zone === 'D' || zone === 'E') estimatedDays = 4;
    else estimatedDays = 5;

    return {
      status: 'success',
      provider: 'delhivery',
      delivery_charges: {
        courier_name: 'Delhivery',
        freight_charge: Math.round(totalAmount),
        estimated_delivery_days: estimatedDays,
        courier_id: 'delhivery',
        zone,
        isServiceable: true,
        message: `Estimated delivery in ${estimatedDays} days`,
      },
    };
  } catch (error) {
    console.error('Error calculating standard shipping:', error);
    return {
      status: 'error',
      provider: 'delhivery',
      delivery_charges: {
        courier_name: 'Delhivery',
        freight_charge: 0,
        isServiceable: false,
        message: error instanceof Error ? error.message : 'Unable to calculate shipping cost',
      },
    };
  }
}

/**
 * Calculate shipping using Delhivery Heavy/Freight API
 */
export async function calculateDelhiveryShippingHeavy(
  body: ShippingRequest
): Promise<ShippingResponse> {
  const { delivery_postcode, totalWeight } = body;
  
  if (!delivery_postcode || !totalWeight) {
    return {
      status: 'error',
      provider: 'delhivery',
      delivery_charges: {
        courier_name: 'Delhivery',
        freight_charge: 0,
        isServiceable: false,
        message: 'Missing required fields',
      },
    };
  }

  try {
    const authToken = await getDelhiveryToken();
    const weightInGrams = Math.round(totalWeight);
    
    const requestBody = {
      dimensions: [
        {
          length_cm: 30,
          width_cm: 20,
          height_cm: 10,
          box_count: 1,
        },
      ],
      weight_g: weightInGrams,
      cheque_payment: false,
      source_pin: PICKUP_PINCODE,
      consignee_pin: delivery_postcode,
      payment_mode: 'prepaid',
      inv_amount: 10,
      freight_mode: 'fod',
      rov_insurance: false,
    };

    const response = await fetch(DELHIVERY_HEAVY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const rawResponse = await response.text();
    let data: HeavyShippingResponse | null = null;
    
    try {
      data = JSON.parse(rawResponse) as HeavyShippingResponse;
    } catch (e) {
      console.error('Failed to parse Delhivery heavy shipping response:', e);
      throw new Error('Invalid JSON response from Delhivery');
    }

    if (!response.ok) {
      let errorMessage = `Delhivery API error: ${response.status}`;
      if (data?.message) {
        errorMessage = data.message;
      }
      throw new Error(errorMessage);
    }

    if (!data || !data.success || !data.data || typeof data.data.total !== 'number') {
      return {
        status: 'error',
        provider: 'delhivery',
        delivery_charges: {
          courier_name: 'Delhivery',
          freight_charge: 0,
          isServiceable: false,
          message: 'Destination not serviceable or invalid response',
        },
      };
    }

    const estimatedAmount = data.data.total || 0;
    const transitTime = 3; // Default transit time
    const priceBreakup = data.data.price_breakup || {};

    return {
      status: 'success',
      provider: 'delhivery',
      delivery_charges: {
        courier_name: 'Delhivery',
        freight_charge: Math.round(estimatedAmount),
        estimated_delivery_days: transitTime,
        courier_id: 'delhivery',
        isServiceable: true,
        message: `Estimated delivery in ${transitTime} days`,
        price_breakup: priceBreakup,
        charged_weight: data.data.charged_wt,
        min_charged_weight: data.data.min_charged_wt,
        raw_response: data,
      },
    };
  } catch (error) {
    console.error('Error calculating heavy shipping:', error);
    return {
      status: 'error',
      provider: 'delhivery',
      delivery_charges: {
        courier_name: 'Delhivery',
        freight_charge: 0,
        isServiceable: false,
        message: error instanceof Error ? error.message : 'Unable to calculate shipping cost',
      },
    };
  }
}

/**
 * Calculate shipping cost - automatically chooses between standard and heavy
 */
export async function calculateDelhiveryShipping(
  body: ShippingRequest
): Promise<ShippingResponse> {
  // Use heavy shipping for weights >= 10kg, standard for lighter packages
  if (body.totalWeight >= HEAVY_SHIPPING_THRESHOLD) {
    return calculateDelhiveryShippingHeavy(body);
  } else {
    return calculateDelhiveryShippingStandard(body);
  }
}

/**
 * Parse XML response from Delhivery API
 */
async function parseXmlResponse(xmlText: string): Promise<unknown> {
  try {
    // Use xml2js for server-side XML parsing
    const xml2js = await import('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(xmlText);
    return result;
  } catch (error) {
    console.error('Failed to parse XML response:', error);
    throw new Error('Failed to parse XML response');
  }
}

