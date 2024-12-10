// src/components/Footer.js
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DMAAG Project</h3>
            <p className="text-gray-400">
              Data Mining and Mapping Antebellum Georgia - A collaborative research 
              initiative exploring historical data of enslaved individuals in Georgia
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">GSU Records Database</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Troy Records Collection</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Research Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Privacy Policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">
              Georgia State University<br />
              Department of History<br />
              Email: research@dmaag.org<br />
              Phone: (404) 555-0123
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                For research inquiries and database access
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Data Mining and Mapping Antebellum Georgia Project</p>
          <p className="text-sm mt-2">
            A collaboration between Georgia State University and Troy University
          </p>
        </div>
      </div>
    </footer>
  );
}