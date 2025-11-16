import { useState, useEffect } from 'react';
import { Check, X, Loader2, ExternalLink, ChevronDown, ChevronUp, HelpCircle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../lib/api';

// Help section component
function HelpSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 border border-blue-200 rounded-lg bg-blue-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 rounded-lg transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-blue-900">
          <HelpCircle className="h-4 w-4" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-blue-700" /> : <ChevronDown className="h-4 w-4 text-blue-700" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-blue-800 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

// Tooltip component
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-gray-600 ml-1"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {show && (
        <div className="absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg -top-2 left-6">
          {text}
        </div>
      )}
    </div>
  );
}

// Status badge component
function StatusBadge({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3" />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <AlertCircle className="h-3 w-3" />
      Not Connected
    </span>
  );
}

export default function IntegrationsSettings() {
  const [activeTab, setActiveTab] = useState('messaging');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showOAuthInfo, setShowOAuthInfo] = useState<string | null>(null);

  // WhatsApp state
  const [whatsappConfig, setWhatsappConfig] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    verifyToken: ''
  });
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);

  // Twilio state
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });
  const [twilioConfigured, setTwilioConfigured] = useState(false);

  // Stripe state
  const [stripeConfig, setStripeConfig] = useState({
    secretKey: '',
    publishableKey: '',
    webhookSecret: ''
  });
  const [stripeConfigured, setStripeConfigured] = useState(false);

  // Email state
  const [emailConfig, setEmailConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: ''
  });
  const [emailConfigured, setEmailConfigured] = useState(false);

  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const [whatsapp, twilio, stripe, email] = await Promise.all([
        api.integrationCredentials.get('whatsapp').catch(() => ({ configured: false })),
        api.integrationCredentials.get('twilio').catch(() => ({ configured: false })),
        api.integrationCredentials.get('stripe').catch(() => ({ configured: false })),
        api.integrationCredentials.get('email').catch(() => ({ configured: false })),
      ]);

      setWhatsappConfigured(whatsapp.configured);
      setTwilioConfigured(twilio.configured);
      setStripeConfigured(stripe.configured);
      setEmailConfigured(email.configured);
    } catch (error) {
      console.error('Error loading integration status:', error);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const handleSaveWhatsApp = async () => {
    try {
      setLoading(true);
      await api.integrationCredentials.saveWhatsApp(whatsappConfig);
      setWhatsappConfigured(true);
      showSuccess('WhatsApp connected successfully! You can now send and receive WhatsApp messages.');
    } catch (error: any) {
      showError('Could not save WhatsApp settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWhatsApp = async () => {
    try {
      setLoading(true);
      const result = await api.integrationCredentials.testWhatsApp();
      setTestResults({ ...testResults, whatsapp: result });
      if (result.success) {
        showSuccess('WhatsApp is working correctly!');
      } else {
        showError('WhatsApp test failed: ' + result.error);
      }
    } catch (error: any) {
      showError('Could not test WhatsApp: ' + error.message);
      setTestResults({ ...testResults, whatsapp: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTwilio = async () => {
    try {
      setLoading(true);
      await api.integrationCredentials.saveTwilio(twilioConfig);
      setTwilioConfigured(true);
      showSuccess('SMS connected successfully! You can now send and receive text messages.');
    } catch (error: any) {
      showError('Could not save SMS settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTwilio = async () => {
    try {
      setLoading(true);
      const result = await api.integrationCredentials.testTwilio();
      setTestResults({ ...testResults, twilio: result });
      if (result.success) {
        showSuccess('SMS is working correctly!');
      } else {
        showError('SMS test failed: ' + result.error);
      }
    } catch (error: any) {
      showError('Could not test SMS: ' + error.message);
      setTestResults({ ...testResults, twilio: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStripe = async () => {
    try {
      setLoading(true);
      await api.integrationCredentials.saveStripe(stripeConfig);
      setStripeConfigured(true);
      showSuccess('Payment system connected successfully! You can now accept payments.');
    } catch (error: any) {
      showError('Could not save payment settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestStripe = async () => {
    try {
      setLoading(true);
      const result = await api.integrationCredentials.testStripe();
      setTestResults({ ...testResults, stripe: result });
      if (result.success) {
        showSuccess('Payment system is working correctly!');
      } else {
        showError('Payment test failed: ' + result.error);
      }
    } catch (error: any) {
      showError('Could not test payments: ' + error.message);
      setTestResults({ ...testResults, stripe: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setLoading(true);
      await api.integrationCredentials.saveEmail(emailConfig);
      setEmailConfigured(true);
      showSuccess('Email connected successfully! You can now send email notifications.');
    } catch (error: any) {
      showError('Could not save email settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setLoading(true);
      const result = await api.integrationCredentials.testEmail();
      setTestResults({ ...testResults, email: result });
      if (result.success) {
        showSuccess('Email is working correctly!');
      } else {
        showError('Email test failed: ' + result.error);
      }
    } catch (error: any) {
      showError('Could not test email: ' + error.message);
      setTestResults({ ...testResults, email: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    setShowOAuthInfo('google');
  };

  const handleConnectMicrosoft = () => {
    setShowOAuthInfo('microsoft');
  };

  const handleConnectZoom = () => {
    setShowOAuthInfo('zoom');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect Your Business Tools</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set up integrations to automate messaging, sync calendars, and accept payments. Don't worry - we'll guide you through each step!
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messaging')}
            className={`${
              activeTab === 'messaging'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            📱 Messaging
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`${
              activeTab === 'calendar'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`${
              activeTab === 'payments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            💳 Payments
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`${
              activeTab === 'video'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            🎥 Video Calls
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            ✉️ Email
          </button>
        </nav>
      </div>

      {/* Messaging Tab */}
      {activeTab === 'messaging' && (
        <div className="space-y-8">
          {/* WhatsApp */}
          <div className="bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      WhatsApp Business
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Chat with your clients on WhatsApp
                    </p>
                  </div>
                </div>
                <StatusBadge configured={whatsappConfigured} />
              </div>

              <HelpSection title="How do I set up WhatsApp?" defaultOpen={!whatsappConfigured}>
                <div className="space-y-3">
                  <p className="font-medium">Follow these simple steps:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Business Manager</a></li>
                    <li>Click on "WhatsApp Accounts" in the left menu</li>
                    <li>Select your WhatsApp Business account</li>
                    <li>Go to "API Setup" or "Settings"</li>
                    <li>Copy the information below and paste it into the fields</li>
                  </ol>
                  <p className="text-xs mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    💡 <strong>Tip:</strong> You'll need a Facebook Business account to use WhatsApp Business API. It's free to set up!
                  </p>
                </div>
              </HelpSection>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your WhatsApp Business Phone Number ID
                    <Tooltip text="This is a unique number that identifies your WhatsApp business phone. You'll find it in your Facebook Business Manager under WhatsApp Settings." />
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.phoneNumberId}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., 123456789012345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Business Account ID
                    <Tooltip text="This identifies your business in Facebook's system. You can find this in Facebook Business Manager settings." />
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.businessAccountId}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., 987654321098765"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token (like a password)
                    <Tooltip text="This is a special code that lets our system send messages on your behalf. Keep it secret! Find it in WhatsApp API Settings." />
                  </label>
                  <input
                    type="password"
                    value={whatsappConfig.accessToken}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Paste your access token here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verify Token (you can make this up)
                    <Tooltip text="This is a secret word you create to verify WhatsApp webhooks. Choose something only you know, like a random password." />
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.verifyToken}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, verifyToken: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., my_secret_token_123"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSaveWhatsApp}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Save WhatsApp Settings
                </button>

                {whatsappConfigured && (
                  <button
                    onClick={handleTestWhatsApp}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Test Connection
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Twilio SMS */}
          <div className="bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📲</div>
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Text Messages (SMS)
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Send and receive regular text messages
                    </p>
                  </div>
                </div>
                <StatusBadge configured={twilioConfigured} />
              </div>

              <HelpSection title="How do I set up text messaging?" defaultOpen={!twilioConfigured}>
                <div className="space-y-3">
                  <p className="font-medium">Follow these simple steps:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Sign up for free at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio.com</a></li>
                    <li>After signing in, go to your <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio Console</a></li>
                    <li>You'll see your Account SID and Auth Token right on the homepage</li>
                    <li>Get a phone number by clicking "Get a Trial Number" or buying a number</li>
                    <li>Copy and paste the information below</li>
                  </ol>
                  <p className="text-xs mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    💡 <strong>Tip:</strong> Twilio gives you a free trial with credit to test. You can upgrade later when you're ready!
                  </p>
                </div>
              </HelpSection>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account SID (your account number)
                    <Tooltip text="This identifies your Twilio account. You'll see it on your Twilio dashboard homepage. It starts with 'AC'." />
                  </label>
                  <input
                    type="text"
                    value={twilioConfig.accountSid}
                    onChange={(e) =>
                      setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Starts with AC..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auth Token (your password)
                    <Tooltip text="This is like your Twilio password. Keep it secret! You'll find it on your Twilio dashboard, sometimes hidden - click to reveal it." />
                  </label>
                  <input
                    type="password"
                    value={twilioConfig.authToken}
                    onChange={(e) =>
                      setTwilioConfig({ ...twilioConfig, authToken: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Paste your auth token here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Twilio Phone Number
                    <Tooltip text="This is the phone number you got from Twilio that will send messages. Include the country code, e.g., +1 for US." />
                  </label>
                  <input
                    type="tel"
                    value={twilioConfig.phoneNumber}
                    onChange={(e) =>
                      setTwilioConfig({ ...twilioConfig, phoneNumber: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSaveTwilio}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Save SMS Settings
                </button>

                {twilioConfigured && (
                  <button
                    onClick={handleTestTwilio}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Test Connection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">📅</div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Google Calendar</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Automatically sync appointments with your Google Calendar
                  </p>
                </div>
              </div>

              <HelpSection title="What does this do?" defaultOpen>
                <p>When you connect Google Calendar:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>New appointments will automatically appear in your Google Calendar</li>
                  <li>Changes to appointments will sync both ways</li>
                  <li>You'll see your schedule across all your devices</li>
                  <li>No need to manually add appointments - it's automatic!</li>
                </ul>
                <p className="text-xs mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  ✨ <strong>Super easy:</strong> Just click the button below and sign in with your Google account. That's it!
                </p>
              </HelpSection>

              <button
                onClick={handleConnectGoogle}
                className="mt-5 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Info className="h-4 w-4 mr-2" />
                Learn How to Connect
              </button>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">📆</div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Outlook Calendar</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Automatically sync appointments with your Outlook/Microsoft Calendar
                  </p>
                </div>
              </div>

              <HelpSection title="What does this do?" defaultOpen>
                <p>When you connect Outlook Calendar:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>New appointments will automatically appear in your Outlook Calendar</li>
                  <li>Works with Outlook.com, Office 365, and Microsoft 365</li>
                  <li>Changes sync automatically - no manual updates needed</li>
                  <li>Perfect if you use Microsoft products for work</li>
                </ul>
                <p className="text-xs mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  ✨ <strong>Super easy:</strong> Just click the button below and sign in with your Microsoft account!
                </p>
              </HelpSection>

              <button
                onClick={handleConnectMicrosoft}
                className="mt-5 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Info className="h-4 w-4 mr-2" />
                Learn How to Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">💳</div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Accept Card Payments
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get paid by credit card, debit card, or Apple Pay
                  </p>
                </div>
              </div>
              <StatusBadge configured={stripeConfigured} />
            </div>

            <HelpSection title="How do I set up payments?" defaultOpen={!stripeConfigured}>
              <div className="space-y-3">
                <p className="font-medium">Follow these simple steps:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Create a free account at <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe.com</a></li>
                  <li>After signing in, go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Developers → API Keys</a></li>
                  <li>You'll see two keys: "Publishable key" and "Secret key"</li>
                  <li>Copy both keys and paste them below</li>
                  <li>For webhooks, go to Developers → Webhooks and create an endpoint</li>
                </ol>
                <p className="text-xs mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  💡 <strong>Tip:</strong> Start with "Test mode" to try it out without real money. Switch to "Live mode" when you're ready!
                </p>
              </div>
            </HelpSection>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key (keep this private!)
                  <Tooltip text="This is like your master password for Stripe. NEVER share this! It starts with 'sk_test_' for testing or 'sk_live_' for real payments." />
                </label>
                <input
                  type="password"
                  value={stripeConfig.secretKey}
                  onChange={(e) =>
                    setStripeConfig({ ...stripeConfig, secretKey: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="sk_test_... or sk_live_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publishable Key (safe to share)
                  <Tooltip text="This key is safe to use in your website. It starts with 'pk_test_' for testing or 'pk_live_' for real payments." />
                </label>
                <input
                  type="text"
                  value={stripeConfig.publishableKey}
                  onChange={(e) =>
                    setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="pk_test_... or pk_live_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret (optional for now)
                  <Tooltip text="This lets Stripe notify you about payments. You can skip this for now and add it later if needed. It starts with 'whsec_'." />
                </label>
                <input
                  type="password"
                  value={stripeConfig.webhookSecret}
                  onChange={(e) =>
                    setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="whsec_... (optional)"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveStripe}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Save Payment Settings
              </button>

              {stripeConfigured && (
                <button
                  onClick={handleTestStripe}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Test Connection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Tab */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🎥</div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Zoom Video Calls</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Automatically create Zoom links for your appointments
                  </p>
                </div>
              </div>

              <HelpSection title="What does this do?" defaultOpen>
                <p>When you connect Zoom:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Each appointment automatically gets a Zoom meeting link</li>
                  <li>Your clients receive the link in their confirmation</li>
                  <li>No need to manually create meetings - it's automatic!</li>
                  <li>Perfect for remote consultations or virtual appointments</li>
                </ul>
                <p className="text-xs mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  ✨ <strong>Simple setup:</strong> Click below and sign in with your Zoom account!
                </p>
              </HelpSection>

              <button
                onClick={handleConnectZoom}
                className="mt-5 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Info className="h-4 w-4 mr-2" />
                Learn How to Connect
              </button>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">📹</div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Google Meet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Use Google Meet for video calls (requires Google Calendar)
                  </p>
                </div>
              </div>

              <HelpSection title="What does this do?" defaultOpen>
                <p>When you use Google Meet:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Free video calling built into Google Calendar</li>
                  <li>No extra app needed - works in any web browser</li>
                  <li>Automatic meeting links for each appointment</li>
                  <li>Great if you already use Gmail or Google Calendar</li>
                </ul>
                <p className="text-xs mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  ℹ️ <strong>Note:</strong> You need to connect Google Calendar first (see Calendar tab above)
                </p>
              </HelpSection>

              <button
                onClick={handleConnectGoogle}
                className="mt-5 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Info className="h-4 w-4 mr-2" />
                Learn How to Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✉️</div>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Send appointment reminders and confirmations by email
                  </p>
                </div>
              </div>
              <StatusBadge configured={emailConfigured} />
            </div>

            <HelpSection title="How do I set this up?" defaultOpen={!emailConfigured}>
              <div className="space-y-3">
                <p className="font-medium">The easiest way (Gmail):</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Account Security</a></li>
                  <li>Turn on "2-Step Verification" if not already on</li>
                  <li>Go to "App Passwords" and create a new one</li>
                  <li>Select "Mail" and "Other device"</li>
                  <li>Copy the 16-character password and use it below</li>
                </ol>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1">
                  <p><strong>Quick Settings for Gmail:</strong></p>
                  <p>• SMTP Host: <code className="bg-white px-1 py-0.5 rounded">smtp.gmail.com</code></p>
                  <p>• Port: <code className="bg-white px-1 py-0.5 rounded">587</code></p>
                  <p>• Email: Your Gmail address</p>
                  <p>• Password: Your App Password (not your regular Gmail password!)</p>
                </div>
                <p className="text-xs mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  💡 <strong>Tip:</strong> Other email providers work too (Outlook, Yahoo, etc.) - just use their SMTP settings
                </p>
              </div>
            </HelpSection>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mail Server (SMTP Host)
                  <Tooltip text="For Gmail use 'smtp.gmail.com'. For Outlook use 'smtp-mail.outlook.com'. For Yahoo use 'smtp.mail.yahoo.com'." />
                </label>
                <input
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, host: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port Number
                  <Tooltip text="Use 587 for most email providers. This is a technical setting - 587 works for Gmail, Outlook, and most others." />
                </label>
                <input
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, port: parseInt(e.target.value) || 587 })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                  <Tooltip text="The email address you want to send notifications from. Your clients will see emails coming from this address." />
                </label>
                <input
                  type="email"
                  value={emailConfig.user}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, user: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                  <Tooltip text="For Gmail, use an App Password (NOT your regular password). For other providers, use your email password." />
                </label>
                <input
                  type="password"
                  value={emailConfig.password}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, password: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Your app password or email password"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailConfig.secure}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, secure: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Use secure connection (SSL/TLS)
                    <Tooltip text="Leave this unchecked for port 587 (recommended). Only check this if using port 465." />
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveEmail}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Save Email Settings
              </button>

              {emailConfigured && (
                <button
                  onClick={handleTestEmail}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Test Connection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OAuth Info Modal */}
      {showOAuthInfo && (
        <OAuthInfoModal
          provider={showOAuthInfo}
          onClose={() => setShowOAuthInfo(null)}
        />
      )}
    </div>
  );
}

// OAuth Info Modal Component
function OAuthInfoModal({ provider, onClose }: { provider: string; onClose: () => void }) {
  const providerInfo: Record<string, { name: string; description: string; steps: string[]; contactInfo: string; docsUrl: string }> = {
    google: {
      name: 'Google Calendar',
      description: 'OAuth integration requires technical setup through Google Cloud Console. This allows secure access to your Google Calendar.',
      steps: [
        'Create a Google Cloud project at console.cloud.google.com',
        'Enable the Google Calendar API',
        'Create OAuth 2.0 credentials',
        'Add authorized redirect URIs',
        'Contact support with your Client ID and Client Secret'
      ],
      contactInfo: 'Contact support at support@avizo.app with your Google OAuth credentials, and we\'ll complete the setup for you!',
      docsUrl: 'https://console.cloud.google.com/'
    },
    microsoft: {
      name: 'Microsoft/Outlook Calendar',
      description: 'OAuth integration requires setup through Azure Portal. This allows secure access to your Outlook/Microsoft Calendar.',
      steps: [
        'Register an application in Azure Portal',
        'Add Microsoft Graph Calendar permissions',
        'Create a client secret',
        'Configure redirect URIs',
        'Contact support with your Application (client) ID and secret'
      ],
      contactInfo: 'Contact support at support@avizo.app with your Microsoft OAuth credentials, and we\'ll complete the setup for you!',
      docsUrl: 'https://portal.azure.com/'
    },
    zoom: {
      name: 'Zoom',
      description: 'OAuth integration requires setup through Zoom App Marketplace. This allows automatic creation of Zoom meetings for your appointments.',
      steps: [
        'Create a Server-to-Server OAuth app at marketplace.zoom.us',
        'Add required scopes (meeting:write)',
        'Copy Account ID, Client ID, and Client Secret',
        'Contact support with your Zoom credentials'
      ],
      contactInfo: 'Contact support at support@avizo.app with your Zoom OAuth credentials, and we\'ll complete the setup for you!',
      docsUrl: 'https://marketplace.zoom.us/'
    }
  };

  const info = providerInfo[provider];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Setting Up {info.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">OAuth Integration Setup</h3>
                <p className="text-sm text-blue-800">{info.description}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Setup Steps:</h3>
            <ol className="space-y-3">
              {info.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">Need Help?</h3>
            <p className="text-sm text-amber-800">
              {info.contactInfo}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={info.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open {provider === 'google' ? 'Google Cloud' : provider === 'microsoft' ? 'Azure Portal' : 'Zoom Marketplace'}
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
