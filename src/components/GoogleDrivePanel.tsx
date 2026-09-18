import React, { useState } from 'react';
import { HardDrive, CloudUpload, Trash2, ExternalLink, RefreshCw, AlertTriangle, FileText, Check } from 'lucide-react';
import { DriveSavedFile } from '../types';

interface GoogleDrivePanelProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  savedFiles: DriveSavedFile[];
  isSaving: boolean;
  isLoadingFiles: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onSaveToDrive: () => void;
  onRefreshFiles: () => void;
  onDeleteFile: (fileId: string) => Promise<void>;
}

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({
  isAuthenticated,
  userEmail,
  savedFiles,
  isSaving,
  isLoadingFiles,
  onSignIn,
  onSignOut,
  onSaveToDrive,
  onRefreshFiles,
  onDeleteFile,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<DriveSavedFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleSaveClick = async () => {
    await onSaveToDrive();
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await onDeleteFile(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 rounded-2xl bg-[#170e07]/90 border border-amber-900/50 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold font-bagan text-amber-200">
            Google Drive အသံမှတ်တမ်း သိမ်းဆည်းမှု (Drive Cloud Storage)
          </h2>
        </div>

        {isAuthenticated && (
          <button
            onClick={onRefreshFiles}
            disabled={isLoadingFiles}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Refresh Files"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <p className="text-xs text-amber-200/80 font-myanmar mt-2">
        Bagan Voice Agent တွင် အသံဖြင့် ပြောဆိုခဲ့သော စာသားများနှင့် ဖုန်းထိန်းချုပ်မှု လုပ်ဆောင်ချက် မှတ်တမ်းများကို သင့် Google Drive ထဲသို့ စနစ်တကျ သိမ်းဆည်းထားနိုင်ပါသည်။
      </p>

      {/* Auth Status & Official Google Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-amber-950">
        {isAuthenticated ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-amber-200 font-medium">
                Google Drive ချိတ်ဆက်ထားသည်: <strong className="text-amber-400">{userEmail}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isSaving ? 'သိမ်းဆည်းနေသည်...' : 'Drive တွင် ယခုသိမ်းမည်'}</span>
              </button>

              <button
                onClick={onSignOut}
                className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <span className="text-xs text-stone-300 font-myanmar">
              Google Drive နှင့် ချိတ်ဆက်ရန် Google Account ဖြင့် Sign in ပြုလုပ်ပါ:
            </span>

            {/* Official Google Sign-In Button compliant with guidelines */}
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-800 font-medium text-xs shadow-md border border-gray-300 transition-all cursor-pointer active:scale-95 select-none"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {saveSuccessNotice && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/60 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Google Drive ထဲသို့ အသံမှတ်တမ်း အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!</span>
        </div>
      )}

      {/* Saved Drive Files List */}
      {isAuthenticated && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-amber-400/80 mb-2">
            Drive တွင် သိမ်းထားသော မှတ်တမ်းဖိုင်များ ({savedFiles.length}):
          </h3>

          {savedFiles.length === 0 ? (
            <div className="p-4 rounded-xl bg-black/30 border border-amber-950 text-center text-xs text-stone-400">
              သိမ်းထားသော အသံမှတ်တမ်းဖိုင် မရှိသေးပါ။ "Drive တွင် ယခုသိမ်းမည်" ကို နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်။
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/60 border border-amber-950 hover:border-amber-800/60 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-amber-200 font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(file.createdTime).toLocaleString('my-MM')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => setDeleteTarget(file)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 cursor-pointer"
                      title="Delete from Google Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Deletion (Workspace Skill Compliance) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md p-5 rounded-2xl bg-[#1c1109] border-2 border-rose-600/60 text-amber-100 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold">Google Drive ဖိုင် ဖျက်ရန် အတည်ပြုပါ</h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              သင်၏ Google Drive ပေါ်ရှိ <strong className="text-rose-300">"{deleteTarget.name}"</strong> ဖိုင်ကို အပြီးတိုင် ဖျက်ပစ်မည်မှာ သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer"
              >
                မဖျက်တော့ပါ (Cancel)
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                {isDeleting ? 'ဖျက်နေသည်...' : 'ဖျက်မည် (Confirm Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
