import { useState, useEffect } from 'react';
import { Check, X, Loader2, ExternalLink } from 'lucide-react';
import api from '../lib/api';

export default function IntegrationsSettings() {
  const [activeTab, setActiveTab] = useState('messaging');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

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
      // Check which integrations are configured
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

  const handleSaveWhatsApp = async () => {
    try {
      setLoading(true);
      await api.integrationCredentials.saveWhatsApp(whatsappConfig);
      setWhatsappConfigured(true);
      alert('WhatsApp credentials saved successfully!');
    } catch (error: any) {
      alert('Error saving WhatsApp credentials: ' + error.message);
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
        alert('WhatsApp connection successful!');
      } else {
        alert('WhatsApp connection failed: ' + result.error);
      }
    } catch (error: any) {
      alert('Error testing WhatsApp: ' + error.message);
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
      alert('Twilio credentials saved successfully!');
    } catch (error: any) {
      alert('Error saving Twilio credentials: ' + error.message);
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
        alert('Twilio connection successful!');
      } else {
        alert('Twilio connection failed: ' + result.error);
      }
    } catch (error: any) {
      alert('Error testing Twilio: ' + error.message);
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
      alert('Stripe credentials saved successfully!');
    } catch (error: any) {
      alert('Error saving Stripe credentials: ' + error.message);
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
        alert('Stripe connection successful!');
      } else {
        alert('Stripe connection failed: ' + result.error);
      }
    } catch (error: any) {
      alert('Error testing Stripe: ' + error.message);
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
      alert('Email credentials saved successfully!');
    } catch (error: any) {
      alert('Error saving email credentials: ' + error.message);
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
        alert('Email connection successful!');
      } else {
        alert('Email connection failed: ' + result.error);
      }
    } catch (error: any) {
      alert('Error testing email: ' + error.message);
      setTestResults({ ...testResults, email: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const { url } = await api.integrations.googleAuth();
      window.location.href = url;
    } catch (error: any) {
      alert('Error connecting to Google: ' + error.message);
    }
  };

  const handleConnectMicrosoft = async () => {
    try {
      const { url } = await api.integrations.microsoftAuth();
      window.location.href = url;
    } catch (error: any) {
      alert('Error connecting to Microsoft: ' + error.message);
    }
  };

  const handleConnectZoom = async () => {
    try {
      const { url } = await api.integrations.zoomAuth();
      window.location.href = url;
    } catch (error: any) {
      alert('Error connecting to Zoom: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect your business tools to automate messaging, calendars, and payments
        </p>
      </div>

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
            Messaging
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`${
              activeTab === 'calendar'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`${
              activeTab === 'payments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`${
              activeTab === 'video'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Video Calling
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Email
          </button>
        </nav>
      </div>

      {/* Messaging Tab */}
      {activeTab === 'messaging' && (
        <div className="space-y-8">
          {/* WhatsApp */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                    WhatsApp Business
                    {whatsappConfigured && <Check className="h-5 w-5 text-green-500" />}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Send and receive WhatsApp messages from your clients
                  </p>
                </div>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.phoneNumberId}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Phone Number ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Account ID
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.businessAccountId}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Business Account ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={whatsappConfig.accessToken}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Access Token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verify Token (for webhooks)
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.verifyToken}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, verifyToken: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Verify Token"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleSaveWhatsApp}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Credentials
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
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                    Twilio SMS
                    {twilioConfigured && <Check className="h-5 w-5 text-green-500" />}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Send and receive SMS messages via Twilio
                  </p>
                </div>
                <a
                  href="https://www.twilio.com/docs/sms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account SID
                  </label>
                  <input
                    type="text"
                    value={twilioConfig.accountSid}
                    onChange={(e) =>
                      setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Account SID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Auth Token
                  </label>
                  <input
                    type="password"
                    value={twilioConfig.authToken}
                    onChange={(e) =>
                      setTwilioConfig({ ...twilioConfig, authToken: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter Auth Token"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={twilioConfig.phoneNumber}
                    onChange={(e) =>
                      setTwilioConfig({ ...twilioConfig, phoneNumber: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleSaveTwilio}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Credentials
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
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Google Calendar</h3>
              <p className="mt-2 text-sm text-gray-500">
                Sync your appointments with Google Calendar
              </p>
              <button
                onClick={handleConnectGoogle}
                className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect Google Calendar
              </button>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Outlook Calendar</h3>
              <p className="mt-2 text-sm text-gray-500">
                Sync your appointments with Outlook/Microsoft Calendar
              </p>
              <button
                onClick={handleConnectMicrosoft}
                className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect Outlook Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                  Stripe Payments
                  {stripeConfigured && <Check className="h-5 w-5 text-green-500" />}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Accept payments from your clients
                </p>
              </div>
              <a
                href="https://stripe.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={stripeConfig.secretKey}
                  onChange={(e) =>
                    setStripeConfig({ ...stripeConfig, secretKey: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="sk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={stripeConfig.publishableKey}
                  onChange={(e) =>
                    setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="pk_test_..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={stripeConfig.webhookSecret}
                  onChange={(e) =>
                    setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="whsec_..."
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSaveStripe}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Credentials
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
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Zoom</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create Zoom meetings for your appointments
              </p>
              <button
                onClick={handleConnectZoom}
                className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect Zoom
              </button>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Google Meet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create Google Meet links for your appointments (requires Google Calendar integration)
              </p>
              <button
                onClick={handleConnectGoogle}
                className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect Google Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                  Email / SMTP Configuration
                  {emailConfigured && <Check className="h-5 w-5 text-green-500" />}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Send email notifications to your clients
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, host: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Port
                </label>
                <input
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, port: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailConfig.user}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, user: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password / App Password
                </label>
                <input
                  type="password"
                  value={emailConfig.password}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, password: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter password or app password"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailConfig.secure}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, secure: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use SSL/TLS</span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSaveEmail}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Credentials
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
    </div>
  );
}
