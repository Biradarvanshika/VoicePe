// -----------------------------------------------------------------------------
// VoicePe IVR Backend Server (with Debugging)
// -----------------------------------------------------------------------------
// This file contains the complete backend logic for the VoicePe IVR system.
// It uses Node.js with the Express framework to create a web server that
// Twilio communicates with to handle the call flow.
//
// How it works:
// 1. A worker calls the Twilio phone number.
// 2. Twilio sends an HTTP request to our server's `/ivr/welcome` endpoint.
// 3. Our server responds with TwiML (Twilio Markup Language) instructions.
// 4. TwiML tells Twilio what to do: play a message, gather speech, etc.
// 5. This process continues, creating an interactive conversation with the user.
// -----------------------------------------------------------------------------

// --- 1. Dependencies ---
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
// Replit automatically handles secrets, but dotenv is good practice for local dev.
require('dotenv').config(); 

// --- 2. Initialization ---
const app = express();
app.use(express.urlencoded({ extended: true }));

// --- NEW: Debugging Section ---
// Let's check if the environment variables (secrets) are loaded correctly.
console.log("--- Checking Environment Variables ---");
console.log("Supabase URL loaded:", !!process.env.SUPABASE_URL); // Should print: true
console.log("Supabase Key loaded:", !!process.env.SUPABASE_ANON_KEY); // Should print: true
console.log("Twilio SID loaded:", !!process.env.TWILIO_ACCOUNT_SID); // Should print: true
console.log("Twilio Token loaded:", !!process.env.TWILIO_AUTH_TOKEN); // Should print: true
console.log("------------------------------------");
// --- End Debugging Section ---


// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;


// --- 3. IVR Endpoints ---

/**
 * @route POST /ivr/welcome
 * This is the primary entry point for all incoming calls from Twilio.
 * It checks if the caller is a known worker and routes them accordingly.
 */
app.post('/ivr/welcome', async (req, res) => {
    console.log("--- Incoming Call to /ivr/welcome ---"); // Log new calls
    const twiml = new VoiceResponse();
    const callerId = req.body.From;

    try {
        // Check if the worker exists in our database
        console.log(`Searching for worker with phone: ${callerId}`);
        const { data: worker, error } = await supabase
            .from('workers')
            .select('*')
            .eq('phone_number', callerId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error here.
            console.error("Supabase error:", error);
            throw new Error(error.message);
        }

        if (worker) {
            // --- Returning Caller Flow ---
            console.log("Found returning worker.");
            const gather = twiml.gather({
                input: 'dtmf', // DTMF means key presses
                numDigits: 1,
                action: `/ivr/handle-returning-choice?skill=${worker.skill}&location=${worker.location}&lang=${worker.language}`,
                method: 'POST',
            });
            const welcomeMessage = worker.language === 'hi-IN' 
                ? `VoicePe में आपका स्वागत है। हम ${worker.location} में '${worker.skill}' की नौकरियों की तलाश करेंगे। नई नौकरियां खोजने के लिए, एक दबाएं। अपनी जानकारी बदलने के लिए, दो दबाएं।`
                : `Welcome back to VoicePe. We will search for '${worker.skill}' jobs in ${worker.location}. Press 1 to find new jobs. Press 2 to update your information.`;
            gather.say({ voice: 'alice', language: worker.language }, welcomeMessage);
        } else {
            // --- New Caller Flow ---
            console.log("New worker detected.");
            const gather = twiml.gather({
                input: 'dtmf',
                numDigits: 1,
                action: '/ivr/handle-language-choice',
                method: 'POST',
            });
            gather.say({ voice: 'alice', language: 'en-US' }, "Welcome to VoicePe, the free job-finding service. To continue in English, press 1.");
            gather.say({ voice: 'alice', language: 'hi-IN' }, "हिंदी में जारी रखने के लिए, दो दबाएं।");
        }

    } catch (error) {
        console.error("!!! CRITICAL ERROR in /ivr/welcome:", error.message);
        twiml.say({ voice: 'alice', language: 'en-US' }, "We are sorry, but there was a system error. Please try again later.");
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * @route POST /ivr/handle-language-choice
 * Handles the language selection for a new user.
 */
app.post('/ivr/handle-language-choice', (req, res) => {
    console.log("--- Handling Language Choice ---");
    const twiml = new VoiceResponse();
    const choice = req.body.Digits;
    const language = choice === '2' ? 'hi-IN' : 'en-US';
    const prompt = language === 'hi-IN'
        ? "अपना काम बताने के लिए, कृपया बोलें। जैसे, 'प्लम्बर', 'पेंटर', या 'मजदूर'।"
        : "To tell us your work, please speak. For example, 'Plumber', 'Painter', or 'Labourer'.";

    const gather = twiml.gather({
        input: 'speech',
        action: `/ivr/handle-skill?lang=${language}`,
        method: 'POST',
        language: language,
        speechTimeout: 'auto',
    });
    gather.say({ voice: 'alice', language: language }, prompt);

    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * @route POST /ivr/handle-skill
 * Gathers the worker's skill via speech and asks for location.
 */
app.post('/ivr/handle-skill', (req, res) => {
    console.log("--- Handling Skill Input ---");
    const twiml = new VoiceResponse();
    const language = req.query.lang;
    const skill = req.body.SpeechResult;

    if (skill) {
        console.log(`Skill captured: ${skill}`);
        const prompt = language === 'hi-IN'
            ? `बहुत अच्छे। अब, कृपया अपने शहर का नाम बोलें।`
            : `Very good. Now, please speak the name of your city.`;

        const gather = twiml.gather({
            input: 'speech',
            action: `/ivr/register-and-find-jobs?lang=${language}&skill=${encodeURIComponent(skill)}`,
            method: 'POST',
            language: language,
            speechTimeout: 'auto',
        });
        gather.say({ voice: 'alice', language: language }, prompt);
    } else {
        // Handle case where speech was not recognized
        console.log("Speech for skill not recognized.");
        twiml.say({ voice: 'alice', language: language }, "Sorry, I didn't catch that. Let's try again.");
        twiml.redirect({ method: 'POST' }, `/ivr/handle-language-choice?Digits=${language === 'hi-IN' ? '2' : '1'}`);
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * @route POST /ivr/register-and-find-jobs
 * Final step for a new user. Registers them and finds jobs.
 */
app.post('/ivr/register-and-find-jobs', async (req, res) => {
    console.log("--- Registering Worker and Finding Jobs ---");
    const twiml = new VoiceResponse();
    const callerId = req.body.From;
    const language = req.query.lang;
    const skill = decodeURIComponent(req.query.skill);
    const location = req.body.SpeechResult;

    if (!location) {
        console.log("Speech for location not recognized.");
        twiml.say({ voice: 'alice', language: language }, "Sorry, I didn't catch the location. Let's try again.");
        twiml.redirect({ method: 'POST' }, `/ivr/handle-skill?lang=${language}&SpeechResult=${skill}`);
        res.type('text/xml');
        res.send(twiml.toString());
        return;
    }

    try {
        // 1. Register the new worker
        console.log(`Registering worker: ${callerId}, ${skill}, ${location}`);
        await supabase.from('workers').insert({
            phone_number: callerId,
            skill: skill,
            location: location,
            language: language
        });
        console.log("Worker registered successfully.");

        // 2. Find jobs for them
        await findAndPresentJobs(twiml, skill, location, language);

    } catch (error) {
        console.error("!!! CRITICAL ERROR in register-and-find-jobs:", error.message);
        twiml.say({ voice: 'alice', language: language }, "Sorry, there was an error saving your details.");
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * @route POST /ivr/handle-returning-choice
 * Handles the choice for a returning user (find jobs or update info).
 */
app.post('/ivr/handle-returning-choice', async (req, res) => {
    console.log("--- Handling Returning User Choice ---");
    const twiml = new VoiceResponse();
    const choice = req.body.Digits;
    const { skill, location, lang } = req.query;

    if (choice === '1') {
        // Find new jobs
        await findAndPresentJobs(twiml, skill, location, lang);
    } else if (choice === '2') {
        // Update info (redirects to the new user flow)
        console.log(`Deleting old worker record for re-registration: ${req.body.From}`);
        await supabase.from('workers').delete().eq('phone_number', req.body.From);
        twiml.redirect({ method: 'POST' }, '/ivr/welcome');
    } else {
        twiml.say({ voice: 'alice', language: lang }, "Invalid choice.");
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});


// --- 4. Helper Functions ---

/**
 * A reusable function to find jobs in Supabase and generate TwiML to present them.
 * @param {VoiceResponse} twiml - The TwiML response object.
 * @param {string} skill - The skill to search for.
 * @param {string} location - The location to search in.
 * @param {string} language - The language for the response.
 */
async function findAndPresentJobs(twiml, skill, location, language) {
    console.log(`Searching for jobs with skill: ${skill}, location: ${location}`);
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('location, contact_number')
        .ilike('job_type', `%${skill}%`) // Case-insensitive search for skill
        .ilike('location', `%${location}%`) // Case-insensitive search for location
        .eq('status', 'open');

    if (error) {
        console.error("Supabase job search error:", error);
        throw new Error(error.message);
    }

    if (jobs && jobs.length > 0) {
        const jobCount = jobs.length;
        console.log(`Found ${jobCount} job(s).`);
        const message = language === 'hi-IN'
            ? `${location} में '${skill}' के लिए ${jobCount} नौकरियां मिली हैं। पहली नौकरी '${jobs[0].location}' में है। मालिक का नंबर सुनने के लिए, एक दबाएं।`
            : `Found ${jobCount} jobs for '${skill}' in ${location}. The first job is at '${jobs[0].location}'. To hear the employer's number, press 1.`;

        const gather = twiml.gather({
            input: 'dtmf',
            numDigits: 1,
            action: `/ivr/provide-contact?number=${jobs[0].contact_number}`,
            method: 'POST',
        });
        gather.say({ voice: 'alice', language: language }, message);
    } else {
        console.log("No jobs found.");
        const message = language === 'hi-IN'
            ? "माफ़ करें, अभी आपके लिए कोई नौकरी नहीं है। जैसे ही कोई नई नौकरी आएगी, हम आपको इसी नंबर पर कॉल करेंगे। धन्यवाद।"
            : "Sorry, there are no jobs for you right now. We will call you on this number as soon as a new job is available. Thank you.";
        twiml.say({ voice: 'alice', language: language }, message);
        twiml.hangup();
    }
}

/**
 * @route POST /ivr/provide-contact
 * Reads out the employer's contact number.
 */
app.post('/ivr/provide-contact', (req, res) => {
    console.log("--- Providing Contact Number ---");
    const twiml = new VoiceResponse();
    const number = req.query.number;

    // Reads the number digit by digit for clarity
    const numberSpaced = number.split('').join(' '); 

    twiml.say({ voice: 'alice', language: 'en-US' }, `The contact number is ${numberSpaced}. I repeat, ${numberSpaced}.`);
    twiml.say({ voice: 'alice', language: 'hi-IN' }, `संपर्क नंबर है ${numberSpaced}.`);
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
});


// --- 5. Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
