import React from 'react';

export default function FeaturesSection() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-primary text-2xl">search</span>
          </div>
          <h3 className="font-medium text-lg text-gray-800 mb-2">Ask Anything</h3>
          <p className="text-gray-600">Type any question or topic you want to learn about in the search bar.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-primary text-2xl">auto_awesome</span>
          </div>
          <h3 className="font-medium text-lg text-gray-800 mb-2">AI Creates Content</h3>
          <p className="text-gray-600">Our AI searches the web and generates an educational video explanation.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-primary text-2xl">movie</span>
          </div>
          <h3 className="font-medium text-lg text-gray-800 mb-2">Watch & Download</h3>
          <p className="text-gray-600">Watch your personalized video explanation and download it for later use.</p>
        </div>
      </div>
    </section>
  );
}
