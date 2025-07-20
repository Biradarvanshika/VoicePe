import React, { useState, useEffect } from 'react';
// This would be installed from npm in a real project.
// For this environment, we'll assume a global 'supabase' object is available
// or we'll create it from a script tag if needed.
// import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
// In a real project, this would be in a separate file e.g., 'src/supabaseClient.js'
const supabaseUrl = 'https://lcxwkdoibcrtbdaqjjzh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeHdrZG9pYmNydGJkYXFqanpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mjg4NzksImV4cCI6MjA2ODQwNDg3OX0.WZ2kDSMbxYfP0Kv4DWhnAZzDNpsVZKJK94lKD43aruY';

// This is a placeholder for the Supabase client. In a real React app, you'd use the official library.
// Since we can't import it here, we'll define a simple mock that uses fetch.
const createClient = (url, key) => {
    return {
        from: (tableName) => ({
            insert: async (data) => {
                const response = await fetch(`${url}/rest/v1/${tableName}`, {
                    method: 'POST',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    return { data: null, error: null };
                } else {
                    const error = await response.json();
                    return { data: null, error };
                }
            },
        }),
    };
};

const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Helper to construct Tailwind CSS class names
const classNames = (...classes) => classes.filter(Boolean).join(' ');

// --- SVG Icons ---
const VoicePeLogoIcon = ({ classname }) => (
  <svg
    className={classname}
    viewBox="0 0 110 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M30 70 C28 60, 32 45, 50 45 L70 30 Q85 40, 70 60 Q80 60, 75 80 Q65 90, 55 80 Q45 70, 30 70 Z"
      fill="#F57C00"
      stroke="#C75100"
      strokeWidth="3"
      />
    <rect x="42" y="60" width="28" height="18" rx="7" fill="#F57C00" />
    <ellipse cx="45" cy="55" rx="5" ry="6" fill="#F57C00" />
    <ellipse cx="55" cy="50" rx="7" ry="5" fill="#F57C00" />
    <path d="M86 54 q18 6 0 16" stroke="#D84315" strokeWidth="4" fill="none" />
    <path d="M92 46 q28 14 0 32" stroke="#D84315" strokeWidth="4" fill="none" />
    <path d="M100 38 q38 22 0 48" stroke="#D84315" strokeWidth="4" fill="none" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MicIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" />
  </svg>
);

const NetworkIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 12a9 9 0 019-9m-9 9a9 9 0 009 9" />
    </svg>
);

const HandshakeIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20l4-4-4-4m-7 8l-4-4 4-4m3 8V4" />
    <path d="M3 12h18" />
  </svg>
);

const XCircleIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- Components ---

const Header = ({ setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { name: 'How It Works', page: 'howitworks' },
    { name: 'Our Mission', page: 'mission' },
  ];

  return (
    <header className="bg-[#FAFAFA] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setCurrentPage('home')} 
            className="flex items-center cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center mr-2">
                <VoicePeLogoIcon classname="w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold text-[#6D4C41]">VoicePe</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href="#" onClick={() => setCurrentPage(link.page)} className="text-gray-600 hover:text-[#F57C00] transition duration-300">{link.name}</a>
            ))}
            <button onClick={() => setCurrentPage('postajob')} className="bg-[#F57C00] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#D84315] transition duration-300 shadow-md">
              Post a Job
            </button>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a key={link.name} href="#" onClick={() => { setCurrentPage(link.page); setIsMenuOpen(false); }} className="text-gray-600 hover:text-[#F57C00] transition duration-300 py-2 text-center">{link.name}</a>
              ))}
              <button onClick={() => { setCurrentPage('postajob'); setIsMenuOpen(false); }} className="bg-[#F57C00] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#D84315] transition duration-300 shadow-md">
                Post a Job
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-100 border-t border-gray-200">
    <div className="container mx-auto px-6 py-6 text-center text-[#6D4C41]">
      <p>&copy; {new Date().getFullYear()} VoicePe. A new voice for India's workforce.</p>
    </div>
  </footer>
);



const HomePage = ({ setCurrentPage }) => {
  const features = [
    {
      icon: <XCircleIcon className="w-12 h-12 text-[#D84315]" />,
      title: "End Unreliable Hires",
      description: "Connect with a pool of workers who are actively seeking jobs right now."
    },
    {
      icon: <HandshakeIcon className="w-12 h-12 text-[#D84315]" />,
      title: "Bypass Middlemen",
      description: "Hire directly and pay fair wages without any commissions or hidden fees."
    },
    {
      icon: <PhoneIcon className="w-12 h-12 text-[#D84315]" />,
      title: "Access a Verified Workforce",
      description: "Our voice-based system helps build a network of trust and reliability."
    }
  ];

  return (
    <div className="bg-[#FAFAFA]">
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#6D4C41] leading-tight">
            Reliable Labour, On Demand.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Instantly connect with verified local workers through a simple phone call. No middlemen, no apps, no fees.
          </p>
          <button onClick={() => setCurrentPage('postajob')} className="mt-10 bg-[#F57C00] text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#D84315] transition duration-300 shadow-xl transform hover:scale-105">
            Post a Job for Free
          </button>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6D4C41]">The Old Way is Broken.</h2>
            <p className="text-gray-600 mt-2">We're fixing the core problems of hiring blue-collar workers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {features.map(feature => (
              <div key={feature.title} className="p-6">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#6D4C41] mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <PhoneIcon className="w-16 h-16 text-[#F57C00]" />,
      title: "1. Worker Calls Our Toll-Free Number",
      description: "Any worker, with any phone, can call our system. No app or internet required."
    },
    {
      icon: <MicIcon className="w-16 h-16 text-[#F57C00]" />,
      title: "2. AI Registers Their Skill & Location",
      description: "Our voice AI asks simple questions in their local language to build a profile."
    },
    {
      icon: <NetworkIcon className="w-16 h-16 text-[#F57C00]" />,
      title: "3. You Post a Job",
      description: "You tell us who you need via our simple web form or even an SMS."
    },
    {
      icon: <HandshakeIcon className="w-16 h-16 text-[#F57C00]" />,
      title: "4. We Connect You Directly",
      description: "Our system instantly matches and notifies relevant workers. You receive details of interested candidates and hire directly."
    }
  ];

  return (
    <div className="bg-[#FAFAFA] py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#6D4C41]">Simple, Transparent, and Fast.</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Our process is designed for the real world, connecting employers and workers without digital barriers.</p>
        </div>
        <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex items-start space-x-6">
                        <div className="flex-shrink-0">{step.icon}</div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#6D4C41] mb-2">{step.title}</h3>
                            <p className="text-gray-500">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const PostAJobPage = () => {
    const [formData, setFormData] = useState({
        jobType: '',
        location: '',
        workersNeeded: 1,
        contactNumber: ''
    });
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error
    const [formError, setFormError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.jobType) tempErrors.jobType = "Job type is required.";
        if (!formData.location) tempErrors.location = "Location is required.";
        if (!formData.contactNumber) {
            tempErrors.contactNumber = "Contact number is required.";
        } else if (!/^\d{10}$/.test(formData.contactNumber)) {
            tempErrors.contactNumber = "Please enter a valid 10-digit phone number.";
        }
        setValidationErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!validate()) {
            return;
        }

        setFormStatus('submitting');
        
        const { data, error } = await supabase
            .from('jobs')
            .insert([{ 
                job_type: formData.jobType, 
                location: formData.location, 
                workers_needed: formData.workersNeeded,
                contact_number: formData.contactNumber,
                status: 'open' // Set a default status
            }]);

        if (error) {
            console.error('Error inserting data:', error);
            setFormStatus('error');
            setFormError(`Submission failed: ${error.message}`);
        } else {
            console.log('Data inserted successfully:', data);
            setFormStatus('success');
        }
    };

    if (formStatus === 'success') {
        return (
            <div className="bg-[#FAFAFA] py-20">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <div className="bg-white p-12 rounded-xl shadow-lg">
                        <h1 className="text-3xl font-bold text-[#6D4C41]">Thank You!</h1>
                        <p className="text-gray-600 mt-4 text-lg">
                            Your job has been posted. We are now notifying workers in your area.
                        </p>
                        <button onClick={() => {
                            setFormStatus('idle');
                            setFormData({ jobType: '', location: '', workersNeeded: 1, contactNumber: '' });
                        }} className="mt-8 bg-[#F57C00] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#D84315] transition duration-300">
                            Post Another Job
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFAFA] py-20">
            <div className="container mx-auto px-6">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#6D4C41]">Find Your Next Worker</h1>
                        <p className="text-gray-600 mt-2">Fill this 60-second form. We'll handle the rest.</p>
                    </div>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">What kind of worker do you need?</label>
                                <select id="jobType" name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#F57C00] focus:border-[#F57C00]">
                                    <option value="" disabled>Select a trade</option>
                                    <option value="Construction Labour">Construction Labour</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Painter">Painter</option>
                                    <option value="Carpenter">Carpenter</option>
                                    <option value="General Helper">General Helper</option>
                                </select>
                                {validationErrors.jobType && <p className="text-red-500 text-xs mt-1">{validationErrors.jobType}</p>}
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Project Location</label>
                                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Gachibowli, Hyderabad" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#F57C00] focus:border-[#F57C00]" />
                                {validationErrors.location && <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>}
                            </div>
                            <div>
                                <label htmlFor="workersNeeded" className="block text-sm font-medium text-gray-700 mb-1">How many workers?</label>
                                <input type="number" id="workersNeeded" name="workersNeeded" value={formData.workersNeeded} onChange={handleChange} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#F57C00] focus:border-[#F57C00]" />
                            </div>
                            <div>
                                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Your Contact Number</label>
                                <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="10-digit mobile number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#F57C00] focus:border-[#F57C00]" />
                                {validationErrors.contactNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.contactNumber}</p>}
                            </div>
                            <div>
                                <button type="submit" disabled={formStatus === 'submitting'} className="w-full bg-[#F57C00] text-white font-bold py-4 rounded-lg text-lg hover:bg-[#D84315] transition duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {formStatus === 'submitting' ? 'Submitting...' : 'Find Workers Now'}
                                </button>
                            </div>
                            {formStatus === 'error' && <p className="text-red-500 text-sm mt-2 text-center">{formError}</p>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const MissionPage = () => (
    <div className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-[#6D4C41]">Our Mission</h1>
                <p className="text-xl text-gray-600 mt-4">
                    To build a more equitable job market for the hands that build our nation.
                </p>
            </div>
            <div className="mt-12 text-lg text-gray-700 space-y-6 leading-relaxed">
                <p>
                    For **500 million daily wage workers** in India, finding the next job is a daily, uncertain struggle. They are the backbone of our economy, yet they are often invisible to the digital world. Traditional job platforms require literacy, smartphones, and resumes—luxuries they cannot afford.
                </p>
                <p>
                    This digital divide forces them into the hands of middlemen who often take a significant cut of their hard-earned wages, perpetuating a cycle of exploitation and instability.
                </p>
                <div className="bg-[#FAFAFA] border-l-4 border-[#F57C00] p-8 rounded-r-lg my-10">
                    <p className="text-2xl font-semibold text-[#6D4C41] italic">
                        "Vahan is LinkedIn for gig workers. VoicePe is the ambulance for invisible laborers."
                    </p>
                </div>
                <p>
                    **VoicePe was born from a simple idea:** What if finding a job was as easy as making a phone call?
                </p>
                <p>
                    We are leveraging the most accessible technology available—the human voice—to create a platform that is inclusive, fair, and empowering. By removing barriers like literacy and internet access, we are giving workers their power back, allowing them to connect directly with employers and build a future with dignity.
                </p>
            </div>
        </div>
    </div>
);


// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'howitworks':
        return <HowItWorksPage />;
      case 'postajob':
        return <PostAJobPage />;
      case 'mission':
        return <MissionPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="font-sans antialiased text-gray-800">
      <Header setCurrentPage={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
