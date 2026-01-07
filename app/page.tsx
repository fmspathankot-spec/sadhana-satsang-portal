export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-5xl font-bold text-orange-600 mb-4">
          🙏 श्री राम शरणम् 🙏
        </h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          साधना सत्संग प्रबंधन प्रणाली
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Registration Card */}
          <a
            href="/registration"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              साधक पंजीकरण
            </h3>
            <p className="text-gray-600 mb-4">
              सत्संग के लिए साधकों का पंजीकरण करें
            </p>
            <div className="text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              शुरू करें →
            </div>
          </a>

          {/* Reports Card */}
          <a
            href="/reports"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              रिपोर्ट जनरेट करें
            </h3>
            <p className="text-gray-600 mb-4">
              PDF और Excel में रिपोर्ट डाउनलोड करें
            </p>
            <div className="text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              देखें →
            </div>
          </a>

          {/* Places Card */}
          <a
            href="/places"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              स्थान प्रबंधन
            </h3>
            <p className="text-gray-600 mb-4">
              विभिन्न स्थानों का प्रबंधन करें
            </p>
            <div className="text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              प्रबंधित करें →
            </div>
          </a>

          {/* Events Card */}
          <a
            href="/events"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              सत्संग कार्यक्रम
            </h3>
            <p className="text-gray-600 mb-4">
              आगामी सत्संग की योजना बनाएं
            </p>
            <div className="text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              योजना बनाएं →
            </div>
          </a>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h3 className="font-semibold text-gray-800 mb-3">संपर्क जानकारी</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>पता:</strong> डॉ. राजन मैनी, काली माता मंदिर रोड, पठानकोट</p>
            <p><strong>दूरभाष:</strong> 0186-2224242, 9872035936</p>
            <p><strong>ईमेल:</strong> shreeramsharnampathankot@gmail.com</p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          श्री राम जय राम जय जय राम
        </p>
      </div>
    </div>
  );
}