export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          🙏 श्री राम शरणम् 🙏
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          साधना सत्संग प्रबंधन प्रणाली
        </h2>
        <div className="space-y-4 text-gray-600">
          <p className="text-lg">
            Welcome to Sadhana Satsang Management Portal
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-left">
              <li>📍 <a href="/places" className="text-orange-600 hover:underline">Places Management</a></li>
              <li>👥 <a href="/sadhaks" className="text-orange-600 hover:underline">Sadhaks Management</a></li>
              <li>📅 <a href="/events" className="text-orange-600 hover:underline">Events Management</a></li>
              <li>📊 <a href="/reports" className="text-orange-600 hover:underline">Reports</a></li>
            </ul>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Contact: 0186-2224242, 9872035936</p>
            <p>Email: shreeramsharnampathankot@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}