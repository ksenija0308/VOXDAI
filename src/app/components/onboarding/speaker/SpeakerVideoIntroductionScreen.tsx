import { useState, useRef, useEffect } from 'react';
import { FormData } from "@/types/formData.ts";
import FormLayout from '../shared/FormLayout';
import svgPaths from '@/imports/svg-yog84ugbyb';
import { authAPI } from '@/api/auth';

interface SpeakerVideoIntroductionScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
  prevDisabled?: boolean;
}

type VideoInputMethod = 'url' | 'upload' | 'record' | null;

export default function SpeakerVideoIntroductionScreen({
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
  prevDisabled = false,
}: SpeakerVideoIntroductionScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<VideoInputMethod>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string>('');
  const [errorType, setErrorType] = useState<'permission' | 'notfound' | 'https' | 'unsupported' | 'other' | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Revoke object URL to prevent memory leak
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const uploadVideoToR2 = async (blob: Blob) => {
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const accessToken = await authAPI.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      // Get signed upload URL
      const res = await fetch(
        'https://api.voxdai.com/functions/v1/generate-upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            folder: 'intro',
            fileName: `${Date.now()}.webm`,
            contentType: 'video/webm',
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to generate upload URL');
      }

      const { signedUrl, key } = await res.json();

      if (!signedUrl) {
        throw new Error('No upload URL returned');
      }

      // Upload video to R2
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/webm',
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload video');
      }

      // Store path in form data — will be saved to speaker_profiles via speakerAPI.saveProfile()
      updateFormData({ videoIntroUrl: key });
      setUploadSuccess(true);
    } catch (error) {
      console.error('Video upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setCameraError('');
      setErrorType(null);
      setIsRequestingPermission(true);

      // Check for HTTPS (required for camera access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setErrorType('https');
        setCameraError('Camera access requires HTTPS. Please use a secure connection.');
        setIsRequestingPermission(false);
        return;
      }

      // Check browser compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorType('unsupported');
        setCameraError('Your browser doesn\'t support camera recording. Please use a modern browser like Chrome, Firefox, or Safari.');
        setIsRequestingPermission(false);
        return;
      }

      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setIsRequestingPermission(false);
      streamRef.current = stream;

      // Show video element and start recording state before attaching stream
      setIsRecording(true);
      setRecordingTime(0);

      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 0));

      // Display stream in video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to prevent feedback
        await videoRef.current.play();
      }

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsPreviewing(true);

        // Save to form data
        const file = new File([blob], 'video-intro.webm', { type: mimeType });
        updateFormData({ videoIntroFile: file });

        // Display recorded video
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          // Revoke old URL if exists
          if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
          }
          // Create and track new URL
          const url = URL.createObjectURL(blob);
          videoUrlRef.current = url;
          videoRef.current.src = url;
          videoRef.current.muted = false;
          videoRef.current.controls = true;
        }

        stopCamera();

        // Upload to R2
        uploadVideoToR2(blob);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsRequestingPermission(false);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setErrorType('permission');
          setCameraError('Camera permission was denied. Please click "Allow" when your browser asks for camera access.');
        } else if (error.name === 'NotFoundError') {
          setErrorType('notfound');
          setCameraError('No camera was detected. Please connect a camera and try again.');
        } else if (error.name === 'NotReadableError') {
          setErrorType('other');
          setCameraError('Your camera is already in use by another application. Please close other apps using the camera and try again.');
        } else {
          setErrorType('other');
          setCameraError(`Unable to access camera: ${error.message}`);
        }
      } else {
        setErrorType('other');
        setCameraError('An unknown error occurred while accessing the camera.');
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleRetakeVideo = () => {
    setIsPreviewing(false);
    setRecordedBlob(null);
    setRecordingTime(0);
    setCameraError('');
    setErrorType(null);
    setUploadError('');
    setUploadSuccess(false);
    updateFormData({ videoIntroFile: null, videoIntroUrl: '' });

    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.srcObject = null;
      videoRef.current.controls = false;
    }
  };

  const handleRetryPermission = () => {
    setCameraError('');
    setErrorType(null);
    handleStartRecording();
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) {
      return 'In Chrome: Click the camera icon in the address bar, then select "Always allow" and reload.';
    } else if (userAgent.includes('firefox')) {
      return 'In Firefox: Click the permissions icon in the address bar, then enable camera and microphone.';
    } else if (userAgent.includes('safari')) {
      return 'In Safari: Go to Safari > Settings for This Website > Camera, then select "Allow".';
    }
    return 'Check your browser settings to enable camera and microphone access for this site.';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveUrl = () => {
    if (videoUrl.trim()) {
      updateFormData({ videoIntroUrl: videoUrl });
    }
  };

  return (
    <FormLayout
      currentStep={3}
      totalSteps={11}
      onNext={nextScreen}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      prevDisabled={prevDisabled}
      progress={progress}
      hideHeader={true}
      hideFooter={true}
    >
      <div className="bg-gradient-to-br from-[#f9fafb] via-white to-[#f9fafb] min-h-screen relative w-full">
        {/* Minimal Header */}
        <div className="absolute top-8 left-8">
          <h1 className="font-['Arimo',sans-serif] font-bold text-[40px] tracking-[-0.8px]">VOXD</h1>
        </div>

        {/* Content */}
        <div className="max-w-[720px] mx-auto pt-32 pb-24 px-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-[24px] border border-[#e5e7eb]/50 shadow-[0px_20px_60px_-15px_rgba(0,0,0,0.08)] p-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-['Arimo',sans-serif] font-bold text-[32px] tracking-[-0.32px]">Video Introduction</h2>
              <div className="bg-[rgba(11,59,46,0.1)] border border-[rgba(11,59,46,0.2)] rounded-full px-4 py-1.5">
                <p className="font-['Inter',sans-serif] text-[16px] text-[#0b3b2e]">Optional</p>
              </div>
            </div>

            <p className="text-[#4a5565] text-[16px] mb-10">
              Add a video introduction to help event organizers get to know you better. Profiles with videos receive 3x more inquiries!
            </p>

            {/* Video Input Method Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {/* Video URL Button */}
              <button
                onClick={() => setSelectedMethod('url')}
                className={`h-[93px] rounded-[12px] border-2 transition-all ${
                  selectedMethod === 'url'
                    ? 'bg-[rgba(11,59,46,0.05)] border-[#0b3b2e]'
                    : 'border-[#d1d5dc] hover:border-[#0b3b2e]/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24">
                    <path
                      d={svgPaths.p203de200}
                      stroke={selectedMethod === 'url' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d={svgPaths.pee0ad00}
                      stroke={selectedMethod === 'url' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span
                    className={`font-['Inter',sans-serif] font-medium text-[16px] ${
                      selectedMethod === 'url' ? 'text-[#0b3b2e]' : 'text-[#364153]'
                    }`}
                  >
                    Video URL
                  </span>
                </div>
              </button>

              {/* Upload File Button */}
              <button
                onClick={() => setSelectedMethod('upload')}
                className={`h-[93px] rounded-[12px] border-2 transition-all ${
                  selectedMethod === 'upload'
                    ? 'bg-[rgba(11,59,46,0.05)] border-[#0b3b2e]'
                    : 'border-[#d1d5dc] hover:border-[#0b3b2e]/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24">
                    <path
                      d={svgPaths.pb007f00}
                      stroke={selectedMethod === 'upload' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d={svgPaths.p1b58ab00}
                      stroke={selectedMethod === 'upload' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d={svgPaths.p1c3e9a70}
                      stroke={selectedMethod === 'upload' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span
                    className={`font-['Inter',sans-serif] font-medium text-[16px] ${
                      selectedMethod === 'upload' ? 'text-[#0b3b2e]' : 'text-[#364153]'
                    }`}
                  >
                    Upload File
                  </span>
                </div>
              </button>

              {/* Record Now Button */}
              <button
                onClick={() => setSelectedMethod('record')}
                className={`h-[93px] rounded-[12px] border-2 transition-all ${
                  selectedMethod === 'record'
                    ? 'bg-[rgba(11,59,46,0.05)] border-[#0b3b2e]'
                    : 'border-[#d1d5dc] hover:border-[#0b3b2e]/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24">
                    <path
                      d={svgPaths.p1b108500}
                      stroke={selectedMethod === 'record' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d={svgPaths.p16b88f0}
                      stroke={selectedMethod === 'record' ? '#0B3B2E' : '#4A5565'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span
                    className={`font-['Inter',sans-serif] font-medium text-[16px] ${
                      selectedMethod === 'record' ? 'text-[#0b3b2e]' : 'text-[#364153]'
                    }`}
                  >
                    Record Now
                  </span>
                </div>
              </button>
            </div>

            {/* Video URL Input Section */}
            {selectedMethod === 'url' && (
              <div className="mb-10">
                <label className="block mb-3 font-['Inter',sans-serif] font-medium text-[14px]">
                  Video URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3.5 border border-[#d1d5dc] rounded-[12px] font-['Inter',sans-serif] text-[16px] text-[rgba(0,0,0,0.5)] focus:border-[#0b3b2e] focus:ring-2 focus:ring-[#0b3b2e]/10 transition-all outline-none"
                  />
                  <button
                    onClick={handleSaveUrl}
                    disabled={!videoUrl.trim()}
                    className={`px-6 py-3.5 rounded-[12px] font-['Inter',sans-serif] font-medium text-[16px] flex items-center gap-2 transition-all ${
                      videoUrl.trim()
                        ? 'bg-[#0b3b2e] text-white hover:bg-[#0b3b2e]/90'
                        : 'bg-[#d1d5dc] text-[#6a7282] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                      <path
                        d="M8 2V10"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.33333"
                      />
                      <path
                        d={svgPaths.p26e09a00}
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.33333"
                      />
                      <path
                        d={svgPaths.p23ad1400}
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.33333"
                      />
                    </svg>
                    Save
                  </button>
                </div>
                <p className="text-[#6a7282] text-[16px] mt-3">
                  Supported platforms: YouTube, Vimeo, Loom
                </p>
              </div>
            )}

            {/* Upload File Section */}
            {selectedMethod === 'upload' && (
              <div className="mb-10">
                <div className="border-2 border-dashed border-[#d1d5dc] rounded-[12px] p-12 text-center hover:border-[#0b3b2e] transition-colors">
                  <p className="text-[#4a5565] text-[16px] mb-2">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <p className="text-[#6a7282] text-[14px]">
                    Maximum file size: 100MB. Supported formats: MP4, MOV, AVI
                  </p>
                </div>
              </div>
            )}

            {/* Record Now Section */}
            {selectedMethod === 'record' && (
              <div className="mb-10">
                {cameraError && (
                  <div className="mb-4 p-5 bg-red-50 border border-red-200 rounded-[12px]">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-red-600 font-medium text-[14px] mb-2">{cameraError}</p>

                        {errorType === 'permission' && (
                          <div className="text-red-700 text-[13px] space-y-2">
                            <p className="font-medium">How to fix this:</p>
                            <ol className="list-decimal ml-4 space-y-1">
                              <li>Look for a camera icon or permissions prompt in your browser's address bar</li>
                              <li>Click it and select "Allow" for camera and microphone</li>
                              <li>Click the "Try Again" button below</li>
                            </ol>
                            <p className="text-[12px] mt-2 italic">{getBrowserInstructions()}</p>
                          </div>
                        )}

                        {errorType === 'notfound' && (
                          <div className="text-red-700 text-[13px]">
                            <p>Make sure your camera is properly connected and not being used by another application.</p>
                          </div>
                        )}

                        {errorType === 'https' && (
                          <div className="text-red-700 text-[13px]">
                            <p>For security reasons, browsers require a secure HTTPS connection to access your camera.</p>
                          </div>
                        )}

                        {(errorType === 'permission' || errorType === 'notfound' || errorType === 'other') && (
                          <button
                            onClick={handleRetryPermission}
                            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                              <path d="M2 8a6 6 0 0 1 10.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M12.5 1v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Try Again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isRequestingPermission && (
                  <div className="mb-4 p-5 bg-blue-50 border border-blue-200 rounded-[12px]">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-blue-900 font-medium text-[14px]">Requesting camera access...</p>
                        <p className="text-blue-700 text-[13px] mt-1">Please click "Allow" when your browser asks for permission</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isRecording && !isPreviewing && !isRequestingPermission && (
                  <div className="border border-[#d1d5dc] rounded-[12px] p-12 text-center bg-[#f9fafb]">
                    <p className="text-[#4a5565] text-[16px] mb-4">
                      Click the button below to start recording your video introduction
                    </p>
                    <button
                      onClick={handleStartRecording}
                      className="bg-[#0b3b2e] text-white px-6 py-3 rounded-[12px] font-['Inter',sans-serif] font-medium text-[16px] hover:bg-[#0b3b2e]/90 transition-all">
                      Start Recording
                    </button>
                  </div>
                )}

                {(isRecording || isPreviewing) && (
                  <div className="border border-[#d1d5dc] rounded-[12px] overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="w-full aspect-video bg-black"
                      playsInline
                    />
                  </div>
                )}

                {isRecording && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-['Inter',sans-serif] font-medium text-[16px] text-[#0b3b2e]">
                          Recording: {formatTime(recordingTime)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleStopRecording}
                      className="bg-red-600 text-white px-6 py-3 rounded-[12px] font-['Inter',sans-serif] font-medium text-[16px] hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <rect x="4" y="4" width="8" height="8" rx="1" />
                      </svg>
                      Stop Recording
                    </button>
                  </div>
                )}

                {isPreviewing && recordedBlob && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isUploading ? (
                          <>
                            <svg className="w-5 h-5 text-[#0b3b2e] animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="font-['Inter',sans-serif] text-[16px] text-[#0b3b2e]">
                              Uploading video...
                            </span>
                          </>
                        ) : uploadSuccess ? (
                          <>
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-['Inter',sans-serif] text-[16px] text-[#0b3b2e]">
                              Video uploaded successfully ({formatTime(recordingTime)})
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-['Inter',sans-serif] text-[16px] text-[#0b3b2e]">
                              Video recorded ({formatTime(recordingTime)})
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={handleRetakeVideo}
                        disabled={isUploading}
                        className={`border-2 border-[#d1d5dc] text-[#4a5565] px-6 py-3 rounded-[12px] font-['Inter',sans-serif] font-medium text-[16px] transition-all flex items-center gap-2 ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#0b3b2e] hover:text-[#0b3b2e]'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                          <path d="M2 8a6 6 0 0 1 10.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M12.5 1v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Retake Video
                      </button>
                    </div>

                    {uploadError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-[12px] flex items-center justify-between">
                        <p className="text-red-600 font-medium text-[14px]">{uploadError}</p>
                        <button
                          onClick={() => recordedBlob && uploadVideoToR2(recordedBlob)}
                          className="bg-red-600 text-white px-4 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] hover:bg-red-700 transition-all"
                        >
                          Retry Upload
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Video Introduction Tips */}
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[16px] p-6">
              <h3 className="font-['Arimo',sans-serif] font-bold text-[24px] mb-4">
                Video Introduction Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-2 text-[#364153] text-[16px]">
                  <span className="text-[#0b3b2e]">•</span>
                  <span>Keep it short and engaging (2-3 minutes is ideal)</span>
                </li>
                <li className="flex gap-2 text-[#364153] text-[16px]">
                  <span className="text-[#0b3b2e]">•</span>
                  <span>Introduce yourself and your expertise</span>
                </li>
                <li className="flex gap-2 text-[#364153] text-[16px]">
                  <span className="text-[#0b3b2e]">•</span>
                  <span>Share what makes you unique as a speaker</span>
                </li>
                <li className="flex gap-2 text-[#364153] text-[16px]">
                  <span className="text-[#0b3b2e]">•</span>
                  <span>Use good lighting and clear audio</span>
                </li>
                <li className="flex gap-2 text-[#364153] text-[16px]">
                  <span className="text-[#0b3b2e]">•</span>
                  <span>Show your personality and speaking style</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevScreen}
              className="border-2 border-[#d1d5dc] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-[#4a5565] hover:border-[#0b3b2e] hover:text-[#0b3b2e] transition-all"
            >
              Back
            </button>
            <button
              onClick={nextScreen}
              className="bg-[#0b3b2e] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-white hover:bg-[#0b3b2e]/90 shadow-lg hover:shadow-xl transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
