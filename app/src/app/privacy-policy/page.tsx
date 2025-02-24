export default function PrivacyPolicy() {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 bg-gradient-to-b from-white to-gray-50">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 py-2">Privacy Policy</h1>
        
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="text-blue-500 mr-2">📊</span>
              1. Information We Collect
            </h2>
            <p className="text-gray-700">When you use our application, we collect:</p>
            <ul className="list-none ml-6 mt-3 space-y-2">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">→</span>
                Basic profile information from LinkedIn (name, email, profile URL)
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">→</span>
                Information you choose to provide in your profile
              </li>
            </ul>
          </section>
  
          <section className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="text-blue-500 mr-2">🔄</span>
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700">We use the collected information to:</p>
            <ul className="list-none ml-6 mt-3 space-y-2">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">→</span>
                Provide and maintain our services
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">→</span>
                Authenticate your identity
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">→</span>
                Enable profile management features
              </li>
            </ul>
          </section>
  
          <section className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="text-blue-500 mr-2">🔒</span>
              3. Data Security
            </h2>
            <p className="text-gray-700">We implement appropriate security measures to protect your personal information.</p>
          </section>
  
          <section className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="text-blue-500 mr-2">🤝</span>
              4. Third-Party Services
            </h2>
            <p className="text-gray-700">We use LinkedIn for authentication. Please refer to LinkedIn&apos;s privacy policy for information about how they handle your data.</p>
          </section>
  
          <section className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="text-blue-500 mr-2">📧</span>
              5. Contact
            </h2>
            <p className="text-gray-700">For any questions about this privacy policy, please contact:</p>
            <p className="mt-2 text-blue-600">[TODO: Insert contact information]</p>
          </section>
  
          <footer className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">© 2024-{new Date().getFullYear()} All rights reserved.</p>
            <p className="text-sm text-gray-600 mt-2">
              This is a university project developed at&nbsp;
              <a href="https://www.fe.up.pt/" 
                 target="_blank" 
                 rel="noopener" 
                 className="text-blue-500 hover:text-blue-700 underline decoration-dotted">
                FEUP - Faculty of Engineering of University of Porto
              </a>
            </p>
          </footer>
        </div>
      </div>
    );
}