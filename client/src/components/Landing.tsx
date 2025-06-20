import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Hero Image */}
      <img
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80"
        alt="Writing notes"
        className="w-full max-w-2xl rounded-xl shadow mb-8 object-cover"
        style={{ maxHeight: 320 }}
      />
      {/* Hero Section */}
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Share your thoughts <span className="text-indigo-600">with the world</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Create, share, and discover notes with our simple and intuitive platform. Join our community of writers and readers today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            to="/register"
            className="px-8 py-3 rounded-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 shadow"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg text-base font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200 shadow"
          >
            Sign in
          </Link>
        </div>
      </div>
      {/* Features Section */}
      <div className="w-full max-w-3xl py-12">
        <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-center mb-2">Features</h2>
        <p className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Everything you need to share your thoughts
        </p>
        <p className="text-xl text-gray-500 text-center mb-10">
          Our platform provides all the tools you need to create, organize, and share your notes with others.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <svg className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Easy to use</h3>
            <p className="text-gray-500">Create and edit notes with our intuitive interface. No complicated setup required.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <svg className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Share instantly</h3>
            <p className="text-gray-500">Share your notes with anyone using a simple link. Control who can view and edit your notes.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <svg className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Stay organized</h3>
            <p className="text-gray-500">Keep your notes organized with tags and categories. Find what you need quickly and easily.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <svg className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Secure and private</h3>
            <p className="text-gray-500">Your notes are secure and private. Choose what to share and with whom.</p>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="w-full max-w-2xl py-12 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          Ready to get started?
        </h2>
        <p className="text-indigo-600 text-lg text-center mb-6">
          Create your account today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 shadow"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-md text-base font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200 shadow"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 