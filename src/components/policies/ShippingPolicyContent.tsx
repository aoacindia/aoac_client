"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Mail, Phone, MapPin, FileText, Package, AlertCircle, Clock, Globe, Map } from "lucide-react"

export function ShippingPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#168e2d] via-[#137a26] to-[#0f6b1f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Truck className="h-4 w-4 mr-2 inline" />
              Shipping & Delivery
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Shipping Policy
            </h1>
            <p className="text-lg text-white/90">
              Last Updated: 20 February 2026
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed">
                This Shipping Policy outlines the terms and conditions governing the shipping and delivery of products purchased through the website <strong>www.aoac.in</strong> (&quot;Website&quot;), owned and operated by <strong>Allahabad Organic Agricultural Company Private Limited</strong> (hereinafter referred to as the &quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;).
              </p>
            </CardContent>
          </Card>

          {/* Section 1 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#168e2d]" />
                1. COMPANY DETAILS
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-[#168e2d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Registered Office Address:</p>
                    <p className="text-gray-700">
                      620 G, Ground Floor, CS Enclave, Road Number 7A, Greenland International School, Beur, Patna, Bihar – 800002, India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#168e2d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Branch Office Address:</p>
                    <p className="text-gray-700">
                      Unit No. 8125, 8th Floor, Sector 4, Gaur City Mall Office Space, Greater Noida West, Gautam Buddha Nagar, Noida, Uttar Pradesh – 201318, India
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Corporate Identification Number (CIN):</p>
                  <p className="font-semibold text-gray-900">U63120BR2025PTC080942</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">FSSAI License Number:</p>
                  <p className="font-semibold text-gray-900">100548745217457</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">GSTIN (Registered Office):</p>
                  <p className="font-semibold text-gray-900">10ABECA4299B1Z4</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">GSTIN (Branch Office):</p>
                  <p className="font-semibold text-gray-900">09ABECA4299B1ZN</p>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex flex-wrap gap-4">
                  <a href="mailto:hello@aoac.in" className="flex items-center gap-2 text-[#168e2d] hover:underline">
                    <Mail className="h-4 w-4" />
                    hello@aoac.in
                  </a>
                  <a href="tel:+918986937875" className="flex items-center gap-2 text-[#168e2d] hover:underline">
                    <Phone className="h-4 w-4" />
                    (+91) 8986937875
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-[#168e2d]" />
                2. SHIPPING COVERAGE
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Allahabad Organic Agricultural Company Private Limited currently ships its packaged food products across India only.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Note:</strong> We do not offer international shipping at this time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-6 w-6 text-[#168e2d]" />
                3. ORDER PROCESSING TIME
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All orders are processed after successful confirmation of payment.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Orders are typically processed within <strong className="text-[#168e2d]">1 to 2 business days</strong> from the date of order placement, excluding Sundays and public holidays.
              </p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-[#168e2d]" />
                4. DELIVERY TIMELINE
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The typical delivery timeline for orders shipped within India is between <strong className="text-[#168e2d]">3 to 7 business days</strong> from the date of dispatch.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Delivery timelines are estimates and may vary depending on:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Delivery location</li>
                <li>Courier partner availability</li>
                <li>Weather conditions</li>
                <li>Natural calamities</li>
                <li>Government restrictions</li>
                <li>Public holidays</li>
                <li>Other unforeseen logistical challenges</li>
              </ul>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Note:</strong> The Company shall not be held liable for delays in delivery caused by factors beyond its reasonable control.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-6 w-6 text-[#168e2d]" />
                5. SHIPPING CHARGES
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Shipping charges, if applicable, shall be displayed at the time of checkout and will be included in the total invoice amount payable by the customer.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Company reserves the right to modify shipping charges at any time without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Map className="h-6 w-6 text-[#168e2d]" />
                6. DELIVERY ADDRESS
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Customers are responsible for providing accurate and complete shipping address details at the time of placing the order.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> The Company shall not be responsible for delivery failures or delays resulting from incorrect or incomplete address information provided by the customer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. DELIVERY ATTEMPTS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our courier partners will make multiple delivery attempts at the provided shipping address.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event that the customer is unavailable to receive the order after multiple attempts, the shipment may be returned to the Company.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Re-dispatch of such returned orders shall be subject to additional shipping charges borne by the customer.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-[#168e2d]" />
                8. LOSS OF SHIPMENT
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If an order is lost during transit and is not delivered to the customer, the customer must notify us promptly at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="space-y-2">
                  <a href="mailto:hello@aoac.in" className="flex items-center gap-2 text-[#168e2d] hover:underline">
                    <Mail className="h-5 w-5" />
                    hello@aoac.in
                  </a>
                  <a href="tel:+918986937875" className="flex items-center gap-2 text-[#168e2d] hover:underline">
                    <Phone className="h-5 w-5" />
                    (+91) 8986937875
                  </a>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Upon verification, the Company may initiate a replacement or refund in accordance with its Return and Refund Policies.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. DAMAGES DURING TRANSIT</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If the product is received in a damaged condition, customers must notify the Company within <strong className="text-[#168e2d]">3 (three) days from the date of delivery</strong> along with relevant photographic or video evidence.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Failure to notify within the stipulated timeframe may result in rejection of any related claims.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. FORCE MAJEURE</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company shall not be held liable for any failure or delay in shipping or delivery of orders due to circumstances beyond its reasonable control including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Natural disasters</li>
                <li>Lockdowns</li>
                <li>Strikes</li>
                <li>Pandemic situations</li>
                <li>Government actions</li>
                <li>Transportation disruptions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. POLICY MODIFICATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Allahabad Organic Agricultural Company Private Limited reserves the right to modify, update, or amend this Shipping Policy at any time without prior notice.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any changes shall become effective immediately upon posting on the Website.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-2 border-[#168e2d] shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-8 w-8 text-[#168e2d]" />
                <h2 className="text-2xl font-bold text-gray-900">Questions About Shipping?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                For any queries related to this Shipping Policy, please contact us:
              </p>
              <div className="space-y-2">
                <a href="mailto:hello@aoac.in" className="flex items-center gap-2 text-[#168e2d] hover:underline">
                  <Mail className="h-5 w-5" />
                  hello@aoac.in
                </a>
                <a href="tel:+918986937875" className="flex items-center gap-2 text-[#168e2d] hover:underline">
                  <Phone className="h-5 w-5" />
                  (+91) 8986937875
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

