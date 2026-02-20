"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Mail, Phone, MapPin, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export function ReturnPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#168e2d] via-[#137a26] to-[#0f6b1f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <RotateCcw className="h-4 w-4 mr-2 inline" />
              Return & Exchange
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Return Policy
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
                This Return Policy outlines the terms and conditions governing the return of products purchased through the website <strong>www.aoac.in</strong> (&quot;Website&quot;), owned and operated by <strong>Allahabad Organic Agricultural Company Private Limited</strong> (hereinafter referred to as the &quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;).
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
                This Return Policy applies to all packaged food products sold by Allahabad Organic Agricultural Company Private Limited through its Website across India.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Due to the consumable and perishable nature of food products, returns are accepted only under limited circumstances as outlined below.
              </p>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-[#168e2d]" />
                3. ELIGIBILITY FOR RETURNS
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Return requests shall be accepted only under the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>The product was received in a damaged condition due to shipping, or</li>
                <li>The product delivered has a genuine issue related to quality or taste.</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Note:</strong> Return requests made for any other reason including but not limited to personal preference, change of mind, or dislike of taste shall not be accepted.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-[#168e2d]" />
                4. RETURN REQUEST TIMELINE
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Customers must notify the Company regarding any eligible return request within <strong className="text-[#168e2d]">3 (three) days from the date of delivery</strong> of the product.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Requests received after the stipulated time period shall not be considered under any circumstances.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. RETURN REQUEST PROCESS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To initiate a return request, customers must contact us via:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
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
              <p className="text-gray-700 leading-relaxed mb-4">
                Customers may be required to provide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Order details</li>
                <li>Description of the issue</li>
                <li>Photographic or video evidence of the damaged or defective product</li>
                <li>Batch details and packaging images</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Note:</strong> Failure to provide sufficient supporting information may result in rejection of the return request.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. INSPECTION AND APPROVAL</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Upon receipt of a return request, the Company shall review the submitted information and may conduct an internal quality inspection.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The approval or rejection of any return request shall be determined solely by Allahabad Organic Agricultural Company Private Limited and such decision shall be final and binding.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                7. NON-RETURNABLE PRODUCTS
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Returns shall not be accepted in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Requests made after 3 days from delivery</li>
                <li>Products opened, used, or partially consumed without a valid quality issue</li>
                <li>Products damaged due to improper storage or handling by the customer</li>
                <li>Products returned without original packaging</li>
                <li>Change of taste preference or personal dislike</li>
                <li>Incorrect address provided by the customer resulting in failed delivery</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. RIGHT TO REFUSE RETURN</h2>
              <p className="text-gray-700 leading-relaxed">
                The Company reserves the absolute right to refuse any return request that does not comply with the conditions mentioned in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. POLICY MODIFICATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Allahabad Organic Agricultural Company Private Limited reserves the right to modify, update, or amend this Return Policy at any time without prior notice.
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
                <RotateCcw className="h-8 w-8 text-[#168e2d]" />
                <h2 className="text-2xl font-bold text-gray-900">Need Help with a Return?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                For any queries related to this Return Policy, please contact us:
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

