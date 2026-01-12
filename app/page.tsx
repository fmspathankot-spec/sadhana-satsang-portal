export default function HomePage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🙏 स्वागत है
        </h1>
        <p className="text-gray-600">
          साधना सत्संग प्रबंधन प्रणाली में आपका स्वागत है
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">👥</div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">कुल साधक</p>
              <p className="text-3xl font-bold">-</p>
            </div>
          </div>
          <a href="/sadhaks" className="text-sm text-orange-100 hover:text-white">
            सभी देखें →
          </a>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">📍</div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">कुल स्थान</p>
              <p className="text-3xl font-bold">-</p>
            </div>
          </div>
          <a href="/places" className="text-sm text-blue-100 hover:text-white">
            प्रबंधित करें →
          </a>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">📅</div>
            <div className="text-right">
              <p className="text-green-100 text-sm">आगामी सत्संग</p>
              <p className="text-3xl font-bold">-</p>
            </div>
          </div>
          <a href="/events" className="text-sm text-green-100 hover:text-white">
            देखें →
          </a>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">📝</div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">नया पंजीकरण</p>
              <p className="text-3xl font-bold">+</p>
            </div>
          </div>
          <a href="/registration" className="text-sm text-purple-100 hover:text-white">
            शुरू करें →
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          त्वरित कार्य
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/registration"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="text-4xl">📝</div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                नया साधक जोड़ें
              </h3>
              <p className="text-sm text-gray-600">
                सत्संग के लिए पंजीकरण करें
              </p>
            </div>
          </a>

          <a
            href="/sadhaks"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="text-4xl">👥</div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                साधकों की सूची
              </h3>
              <p className="text-sm text-gray-600">
                सभी साधक देखें और प्रबंधित करें
              </p>
            </div>
          </a>

          <a
            href="/reports"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                रिपोर्ट डाउनलोड करें
              </h3>
              <p className="text-sm text-gray-600">
                PDF और Excel में निर्यात करें
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📞 संपर्क जानकारी
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-orange-600 mb-1">पता:</p>
            <p>डॉ. राजन मैनी</p>
            <p>काली माता मंदिर रोड, पठानकोट</p>
          </div>
          <div>
            <p className="font-semibold text-orange-600 mb-1">दूरभाष:</p>
            <p>0186-2224242</p>
            <p>9872035936</p>
          </div>
          <div>
            <p className="font-semibold text-orange-600 mb-1">ईमेल:</p>
            <p>shreeramsharnampathankot@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>श्री राम जय राम जय जय राम 🙏</p>
      </div>
    </div>
  );
}