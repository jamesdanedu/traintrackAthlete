// public/src/js/config.js
// Configuration file for TrainTrack Athlete PWA

const CONFIG = {
    // API Configuration
    // For local development with backend running locally:
    // API_BASE_URL: 'http://localhost:3001/api',
    
    // For local development with deployed backend:
    // API_BASE_URL: 'https://your-traintrack-backend.vercel.app/api',
    
    // For production (both deployed):
    API_BASE_URL: 'https://traintracksc.vercel.app/api',
    
    // Default - tries to use same origin (only works if backend is on same domain)
    //API_BASE_URL: window.location.origin + '/api',
    
    // App Configuration
    APP_NAME: 'TrainTrack Athlete',
    APP_VERSION: '1.0.0',
    
    // Feature Flags
    FEATURES: {
        OFFLINE_MODE: true,
        PUSH_NOTIFICATIONS: false,
        BIOMETRIC_AUTH: false,
        EMAIL_VERIFICATION_REQUIRED: false // Set to true in production
    },
    
    // Session Configuration
    SESSION: {
        REMEMBER_ME_DAYS: 30,
        DEFAULT_TIMEOUT_HOURS: 24
    },
    
    // Development Settings
    DEBUG: true, // Set to false in production
    LOG_API_CALLS: true // Set to false in production
};

// Helper function to get API endpoint
function getApiEndpoint(path) {
    const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return baseUrl + cleanPath;
}

// Update the existing apiRequest function to use this config
async function apiRequest(endpoint, options = {}) {
    const sessionToken = getStoredSession();
    
    const url = getApiEndpoint(endpoint);
    
    if (CONFIG.LOG_API_CALLS) {
        console.log('📡 API Call:', {
            url,
            method: options.method || 'GET',
            hasAuth: !!sessionToken
        });
    }
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    if (sessionToken && sessionToken !== 'undefined') {
        config.headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    try {
        const response = await fetch(url, config);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { message: 'No response data' };
        }
        
        if (CONFIG.LOG_API_CALLS) {
            console.log('📡 API Response:', {
                url,
                status: response.status,
                data
            });
        }
        
        if (response.status === 401) {
            handleAuthFailure();
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('❌ API request failed:', error);
        
        // If offline, try to handle gracefully
        if (!navigator.onLine && CONFIG.FEATURES.OFFLINE_MODE) {
            console.log('📱 Device is offline, will sync when connected');
            // Handle offline scenario
        }
        
        throw error;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiEndpoint, apiRequest };
}
