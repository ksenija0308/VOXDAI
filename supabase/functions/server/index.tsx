import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client
const getSupabaseClient = (accessToken?: string) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    accessToken || Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

// Health check
app.get('/make-server-3a218522/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

// Sign up new user (organizer or speaker)
app.post('/make-server-3a218522/auth/signup', async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();
    
    if (!email || !password || !name || !userType) {
      return c.json({ error: 'Missing required fields: email, password, name, userType' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during user signup for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User signed up successfully: ${email} (${userType})`);
    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: 'Signup failed', details: String(error) }, 500);
  }
});

// ==================== ORGANIZER PROFILE ROUTES ====================

// Save organizer profile
app.post('/make-server-3a218522/organizer/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: Missing access token' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Authorization error while saving organizer profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    
    // Save profile to KV store
    await kv.set(`organizer:profile:${user.id}`, profileData);
    
    console.log(`Organizer profile saved for user ${user.id}`);
    return c.json({ success: true, message: 'Profile saved successfully' });
  } catch (error) {
    console.log(`Error saving organizer profile: ${error}`);
    return c.json({ error: 'Failed to save profile', details: String(error) }, 500);
  }
});

// Get organizer profile
app.get('/make-server-3a218522/organizer/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: Missing access token' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Authorization error while fetching organizer profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`organizer:profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    console.log(`Organizer profile retrieved for user ${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching organizer profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile', details: String(error) }, 500);
  }
});

// ==================== SPEAKER PROFILE ROUTES ====================

// Save speaker profile
app.post('/make-server-3a218522/speaker/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: Missing access token' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Authorization error while saving speaker profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    
    // Save profile to KV store
    await kv.set(`speaker:profile:${user.id}`, profileData);
    
    // Add to searchable speakers list
    const speakersList = await kv.get('speakers:all') || [];
    if (!speakersList.includes(user.id)) {
      speakersList.push(user.id);
      await kv.set('speakers:all', speakersList);
    }
    
    console.log(`Speaker profile saved for user ${user.id}`);
    return c.json({ success: true, message: 'Profile saved successfully' });
  } catch (error) {
    console.log(`Error saving speaker profile: ${error}`);
    return c.json({ error: 'Failed to save profile', details: String(error) }, 500);
  }
});

// Get speaker profile
app.get('/make-server-3a218522/speaker/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: Missing access token' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Authorization error while fetching speaker profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`speaker:profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    console.log(`Speaker profile retrieved for user ${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching speaker profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile', details: String(error) }, 500);
  }
});

// ==================== FILE UPLOAD ROUTES ====================

// Upload file (photo/logo) to Supabase Storage
app.post('/make-server-3a218522/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: Missing access token' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Authorization error during file upload: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'photo' or 'logo'
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const bucketName = 'make-3a218522-uploads';
    
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created storage bucket: ${bucketName}`);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${fileType}-${Date.now()}.${fileExt}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.log(`Error uploading file for user ${user.id}: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    console.log(`File uploaded successfully for user ${user.id}: ${fileName}`);
    return c.json({ 
      success: true, 
      url: urlData?.signedUrl,
      path: fileName 
    });
  } catch (error) {
    console.log(`Error during file upload: ${error}`);
    return c.json({ error: 'Failed to upload file', details: String(error) }, 500);
  }
});

// ==================== CONTACT FORM ROUTE ====================

// Send contact form email
app.post('/make-server-3a218522/contact', async (c) => {
  try {
    const { firstName, lastName, email, message } = await c.req.json();
    
    if (!firstName || !lastName || !email || !message) {
      return c.json({ error: 'Missing required fields: firstName, lastName, email, message' }, 400);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY environment variable not set');
      return c.json({ error: 'Email service not configured. RESEND_API_KEY is missing.' }, 500);
    }

    console.log(`Attempting to send contact form email from ${email} (${firstName} ${lastName})`);

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'VOXD Contact Form <onboarding@resend.dev>',
        to: ['x.koroljova@gmail.com'],
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.log(`Error sending email via Resend (Status ${resendResponse.status}): ${JSON.stringify(resendData)}`);
      return c.json({ 
        error: 'Failed to send email', 
        details: resendData,
        statusCode: resendResponse.status 
      }, 500);
    }

    console.log(`Contact form email sent successfully from ${email}. Resend response:`, resendData);
    return c.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.log(`Unexpected error sending contact form email: ${error}`);
    return c.json({ error: 'Failed to send email', details: String(error) }, 500);
  }
});

console.log('VOXD Server starting...');
Deno.serve(app.fetch);