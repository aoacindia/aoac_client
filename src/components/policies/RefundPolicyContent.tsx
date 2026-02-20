"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Mail, Phone, MapPin, FileText, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react"

export function RefundPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#168e2d] via-[#137a26] to-[#0f6b1f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <DollarSign className="h-4 w-4 mr-2 inline" />
              Refunds & Payments
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Refund Policy
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
                This Refund Policy outlines the terms and conditions governing the refund of payments for products purchased through the website <strong>www.aoac.in</strong> (&quot;Website&quot;), owned and operated by <strong>Allahabad Organic Agricultural Company Private Limited</strong> (hereinafter referred to as the &quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;).
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. APPLICABILITY</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This Refund Policy applies to all purchases made by customers through the Website for packaged food products sold by Allahabad Organic Agricultural Company Private Limited.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Due to the consumable nature of food products, refunds shall only be granted under specific conditions as outlined below.
              </p>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-[#168e2d]" />
                3. ELIGIBILITY FOR REFUND
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refunds shall be processed only under the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>A verified issue related to the quality of the product is found, as determined solely by Allahabad Organic Agricultural Company Private Limited after internal review; or</li>
                <li>The ordered product is lost during transit and is not delivered to the customer.</li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
                <p className="font-semibold text-gray-900 mb-2">Refunds shall not be provided for reasons including but not limited to:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Change of mind</li>
                  <li>Personal taste preference</li>
                  <li>Delay in delivery caused by courier or logistics partners</li>
                  <li>Incorrect address provided by the customer</li>
                  <li>Improper storage or handling of product by the customer</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-[#168e2d]" />
                4. REFUND REQUEST TIMELINE
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Customers must raise a refund request within <strong className="text-[#168e2d]">3 (three) days from the date of order placement</strong> by contacting us at:
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
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Requests received after the stipulated time period shall not be entertained.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. REFUND REVIEW PROCESS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Upon receipt of a refund request, the Company may require the customer to provide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Order details</li>
                <li>Description of the issue</li>
                <li>Supporting photographic or video evidence</li>
                <li>Packaging and batch details</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company shall review the submitted information and may conduct an internal quality inspection before making a determination.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The decision of Allahabad Organic Agricultural Company Private Limited regarding approval or rejection of any refund request shall be final and binding.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-[#168e2d]" />
                6. MODE OF REFUND
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Approved refunds shall be processed using the same payment method originally used for placing the order, unless otherwise determined by the Company.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-[#168e2d]" />
                7. REFUND PROCESSING TIME
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refunds, once approved, shall be processed within <strong className="text-[#168e2d]">7 to 10 business days</strong> from the date of approval.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Note:</strong> The actual credit of the refunded amount may vary depending on the policies of the customer&apos;s bank or payment service provider.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                8. RIGHT TO REFUSE REFUND
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The Company reserves the right to refuse any refund request that does not comply with the terms mentioned in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. POLICY MODIFICATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Allahabad Organic Agricultural Company Private Limited reserves the right to modify, update, or amend this Refund Policy at any time without prior notice.
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
                <DollarSign className="h-8 w-8 text-[#168e2d]" />
                <h2 className="text-2xl font-bold text-gray-900">Need Help with a Refund?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                For any queries related to this Refund Policy, please contact us:
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

