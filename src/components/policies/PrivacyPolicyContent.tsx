"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Mail, Phone, MapPin, Lock, Eye, Users, FileText } from "lucide-react"

export function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#168e2d] via-[#137a26] to-[#0f6b1f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Shield className="h-4 w-4 mr-2 inline" />
              Privacy & Data Protection
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Privacy Policy
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
                This Privacy Policy describes how <strong>Allahabad Organic Agricultural Company Private Limited</strong> (hereinafter referred to as the &quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;) collects, uses, stores, processes, and protects the personal information of users (hereinafter referred to as &quot;You&quot;, &quot;Your&quot;, or &quot;User&quot;) who access or use our website <strong>www.aoac.in</strong> (&quot;Website&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Company is committed to protecting your privacy and ensuring the security of your personal data in compliance with applicable Indian laws including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. INFORMATION WE COLLECT</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We may collect the following types of personal information from you when you access or use our Website:
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#168e2d]" />
                  2.1 Personal Identification Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>Shipping Address</li>
                  <li>Billing Address</li>
                  <li>PIN Code</li>
                  <li>Order Details</li>
                  <li>Transaction Information</li>
                </ul>
              </div>

              <div className="mb-6 border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#168e2d]" />
                  2.2 Payment Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We do not store your debit/credit card details, UPI credentials, net banking credentials, or any financial account information on our servers. All payments are processed securely through authorized third-party payment gateways.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#168e2d]" />
                  2.3 Technical Information
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may automatically collect certain technical information including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>IP Address</li>
                  <li>Browser Type</li>
                  <li>Device Information</li>
                  <li>Operating System</li>
                  <li>Website Usage Data</li>
                  <li>Access Time and Date</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. PURPOSE OF COLLECTION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your personal information may be used for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Processing and fulfilling your orders</li>
                <li>Delivering purchased products</li>
                <li>Customer support and grievance redressal</li>
                <li>Improving our products and services</li>
                <li>Sending order confirmations and updates</li>
                <li>Compliance with legal and regulatory obligations</li>
                <li>Preventing fraudulent transactions</li>
                <li>Internal record keeping</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. SHARING OF INFORMATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                However, we may share your personal data with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Logistics and courier partners for delivery of products</li>
                <li>Payment gateway service providers for transaction processing</li>
                <li>Government authorities or regulatory bodies when required by law</li>
                <li>Service providers assisting in Website operation</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Such disclosures shall be made only for legitimate business purposes or as mandated by applicable law.
              </p>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-[#168e2d]" />
                5. DATA SECURITY
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement reasonable security practices and procedures to safeguard your personal data from unauthorized access, misuse, alteration, or disclosure.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Despite our efforts, no data transmission over the internet can be guaranteed to be completely secure. Users are advised to take necessary precautions while sharing personal information online.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. COOKIES</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Website may use cookies to enhance user experience, track Website usage, and improve our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may choose to disable cookies through your browser settings. However, disabling cookies may affect certain functionalities of the Website.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. DATA RETENTION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information only for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Fulfill the purposes outlined in this Privacy Policy</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. USER RIGHTS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal information</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You may exercise these rights by contacting us at <a href="mailto:hello@aoac.in" className="text-[#168e2d] hover:underline">hello@aoac.in</a>.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. THIRD-PARTY LINKS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of such external websites.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Users are advised to review the privacy policies of third-party websites before sharing any personal information.
              </p>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. CHILDREN&apos;S PRIVACY</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Website is not intended for use by individuals below the age of 18 years. We do not knowingly collect personal information from minors.
              </p>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. POLICY UPDATES</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to update or modify this Privacy Policy at any time without prior notice.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any changes shall be effective immediately upon posting on the Website. Continued use of the Website after such modifications shall constitute your acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Section 12 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. CONTACT INFORMATION</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or grievances regarding this Privacy Policy or the processing of your personal data, you may contact us at:
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

          {/* Contact Section */}
          <Card className="border-2 border-[#168e2d] shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-[#168e2d]" />
                <h2 className="text-2xl font-bold text-gray-900">Questions About Your Privacy?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about how we handle your personal information, please don&apos;t hesitate to reach out to us:
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

