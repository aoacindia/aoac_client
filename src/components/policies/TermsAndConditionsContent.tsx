"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Scale, Shield, Mail, Phone, MapPin } from "lucide-react"

export function TermsAndConditionsContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#168e2d] via-[#137a26] to-[#0f6b1f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <FileText className="h-4 w-4 mr-2 inline" />
              Legal Information
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Terms and Conditions
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
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to <strong>www.aoac.in</strong> (hereinafter referred to as the &quot;Website&quot;), owned and operated by <strong>Allahabad Organic Agricultural Company Private Limited</strong>, a company incorporated under the provisions of the Companies Act, 2013, having its Registered Office at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-[#168e2d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Registered Office:</p>
                    <p className="text-gray-700">
                      620 G, Ground Floor, CS Enclave, Road Number 7A, Greenland International School, Beur, Patna, Bihar – 800002, India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#168e2d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Branch Office:</p>
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
                <p className="text-gray-700 mb-2">For any queries or concerns, you may contact us at:</p>
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

          {/* Section 1 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-[#168e2d]" />
                1. ACCEPTANCE OF TERMS
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing, browsing, or using this Website, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions (&quot;Terms&quot;). These Terms govern your use of the Website and the purchase of any products offered for sale by Allahabad Organic Agricultural Company Private Limited.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you do not agree with any part of these Terms, you must refrain from using this Website.
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. ELIGIBILITY</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using this Website, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You are at least 18 years of age.</li>
                <li>You are legally capable of entering into binding contracts under applicable Indian laws.</li>
                <li>All information provided by you during registration or purchase is accurate and complete.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. NATURE OF BUSINESS</h2>
              <p className="text-gray-700 leading-relaxed">
                Allahabad Organic Agricultural Company Private Limited is engaged in the business of selling packaged food products through its Website across India. All products sold are packaged consumable goods intended for personal use.
              </p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. PRODUCT INFORMATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to ensure that all product descriptions, images, and pricing details are accurate and up to date. However:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Minor variations may occur due to packaging updates or manufacturer changes.</li>
                <li>Taste, aroma, and quality perception may vary from person to person.</li>
                <li>We do not guarantee that product descriptions or other content on the Website are error-free.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify product details, pricing, or availability without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. ORDER ACCEPTANCE</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All orders placed through the Website shall be deemed as an offer by you to purchase products. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Accept or reject any order at our sole discretion.</li>
                <li>Limit quantities purchased per person or per order.</li>
                <li>Cancel orders in case of pricing errors, stock unavailability, or suspected fraudulent activity.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Order confirmation does not guarantee acceptance of the order.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. PAYMENT TERMS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We accept the following payment methods:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>UPI</li>
                <li>Debit Card</li>
                <li>Credit Card</li>
                <li>Net Banking</li>
                <li>Bank Transfer</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                All payments must be completed before dispatch of the order. We are not responsible for any payment failures or delays caused by third-party payment gateways or banking institutions.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. SHIPPING AND DELIVERY</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We ship products across India. The typical delivery timeline is between <strong>3 to 7 business days</strong> from the date of order confirmation.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Delivery timelines are estimates and may vary due to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Courier service delays</li>
                <li>Weather conditions</li>
                <li>Natural calamities</li>
                <li>Government restrictions</li>
                <li>Other unforeseen circumstances</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We shall not be held liable for delays in delivery beyond our reasonable control.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. ORDER CANCELLATION</h2>
              <p className="text-gray-700 leading-relaxed">
                Once an order has been placed on the Website, it <strong>cannot be cancelled</strong> under any circumstances.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. RETURNS, REFUNDS AND REPLACEMENTS</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Return/Replacement Eligibility</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Return or replacement requests shall be accepted only if:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>The product was damaged during shipping, or</li>
                  <li>There is a genuine issue in product quality or taste.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You must notify us of such issues within <strong>3 (three) days from the date of delivery</strong> by contacting us at <a href="mailto:hello@aoac.in" className="text-[#168e2d] hover:underline">hello@aoac.in</a>.
                </p>
              </div>

              <div className="mb-6 border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Refund Eligibility</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Refunds shall only be processed if:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>A verified quality issue is found in the product, and such determination shall be made solely by Allahabad Organic Agricultural Company Private Limited after review, or</li>
                  <li>The product is lost during delivery.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Refund requests must be raised within <strong>3 (three) days from the date of order placement</strong>.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Final Decision</h3>
                <p className="text-gray-700 leading-relaxed">
                  The decision to approve or reject any return, refund, or replacement request shall rest solely with Allahabad Organic Agricultural Company Private Limited and shall be final and binding.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. INTELLECTUAL PROPERTY RIGHTS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Website including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Logos</li>
                <li>Text</li>
                <li>Graphics</li>
                <li>Images</li>
                <li>Product descriptions</li>
                <li>Software</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                are the intellectual property of Allahabad Organic Agricultural Company Private Limited and are protected under applicable Indian intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Unauthorized use, reproduction, or distribution is strictly prohibited.
              </p>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. LIMITATION OF LIABILITY</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Allahabad Organic Agricultural Company Private Limited shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Any indirect, incidental, or consequential damages.</li>
                <li>Any adverse reaction caused due to consumption of products.</li>
                <li>Any misuse of products purchased from the Website.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Our total liability shall not exceed the amount paid by you for the purchased product.
              </p>
            </CardContent>
          </Card>

          {/* Section 12 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. INDEMNIFICATION</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Allahabad Organic Agricultural Company Private Limited from any claims, liabilities, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                <li>Your breach of these Terms.</li>
                <li>Misuse of the Website or products.</li>
                <li>Violation of applicable laws.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 13 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. FORCE MAJEURE</h2>
              <p className="text-gray-700 leading-relaxed">
                We shall not be held responsible for any failure or delay in performance due to events beyond our reasonable control including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                <li>Natural disasters</li>
                <li>Government actions</li>
                <li>Lockdowns</li>
                <li>Pandemic situations</li>
                <li>Transportation disruptions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 14 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. GOVERNING LAW AND JURISDICTION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of courts located in <strong>Prayagraj, Uttar Pradesh, India</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Section 15 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. ARBITRATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of any dispute or claim arising out of or in connection with these Terms:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>The dispute shall first be attempted to be resolved amicably.</li>
                <li>Failing such resolution, the dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996.</li>
                <li>The arbitration shall be conducted by a sole arbitrator appointed by Allahabad Organic Agricultural Company Private Limited.</li>
                <li>The seat and venue of arbitration shall be Prayagraj, Uttar Pradesh.</li>
                <li>The language of arbitration shall be English.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                The arbitration award shall be final and binding upon both parties.
              </p>
            </CardContent>
          </Card>

          {/* Section 16 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. MODIFICATIONS</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to update or modify these Terms at any time without prior notice. Continued use of the Website after such changes shall constitute acceptance of the revised Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-2 border-[#168e2d] shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-[#168e2d]" />
                <h2 className="text-2xl font-bold text-gray-900">Questions or Concerns?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
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

