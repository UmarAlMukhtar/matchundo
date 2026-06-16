'use client';

import { useState, useEffect } from 'react';
import { Screening } from '@/lib/db';
import {
  loginAdmin,
  logoutAdmin,
  createScreeningAction,
  updateScreeningAction,
  deleteScreeningAction
} from '@/app/actions';
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  MapPin,
  Calendar,
  Clock,
  Lock,
  X,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AdminPanelProps {
  initialAuthenticated: boolean;
  initialScreenings: Screening[];
}

interface ValidationErrors {
  matchName?: string;
  venueName?: string;
  city?: string;
  address?: string;
  screeningDatetime?: string;
}

interface ToastMessage {
  type: 'success' | 'error';
  text: string;
}

// Helper to convert date to YYYY-MM-DDThh:mm format for datetime-local input
function toLocalDatetimeString(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export default function AdminPanel({
  initialAuthenticated,
  initialScreenings
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [screenings, setScreenings] = useState<Screening[]>(initialScreenings);
  
  // Auth Form States
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // CRUD Form / Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState('');
  
  // Custom delete confirmation modal state
  const [confirmDeleteScreening, setConfirmDeleteScreening] = useState<Screening | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form Fields
  const [matchName, setMatchName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('Kochi');
  const [address, setAddress] = useState('');
  const [screeningDatetime, setScreeningDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  // Auto-dismiss toasts after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  };

  // Handle Admin Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const result = await loginAdmin(password);
      if (result.success) {
        setIsAuthenticated(true);
        triggerToast('success', 'Logged in successfully.');
      } else {
        setLoginError(result.error || 'Login failed.');
        triggerToast('error', result.error || 'Login failed.');
      }
    } catch {
      setLoginError('Error connecting to authentication action.');
      triggerToast('error', 'Error connecting to authentication action.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setIsAuthenticated(false);
      setPassword('');
      triggerToast('success', 'Logged out successfully.');
    } catch {
      triggerToast('error', 'Logout action failed.');
    }
  };

  // Open Modal for Create Mode
  const openCreateModal = () => {
    setEditingScreening(null);
    setMatchName('');
    setVenueName('');
    setCity('Kochi');
    setAddress('');
    setScreeningDatetime('');
    setDescription('');
    setPosterImageUrl('');
    setGoogleMapsLink('');
    setValidationErrors({});
    setFormError('');
    setShowModal(true);
  };

  // Open Modal for Edit Mode
  const openEditModal = (screening: Screening) => {
    setEditingScreening(screening);
    setMatchName(screening.match_name);
    setVenueName(screening.venue_name);
    setCity(screening.city);
    setAddress(screening.address);
    setScreeningDatetime(toLocalDatetimeString(screening.screening_datetime));
    setDescription(screening.description);
    setPosterImageUrl(screening.poster_image_url || '');
    setGoogleMapsLink(screening.google_maps_link || '');
    setValidationErrors({});
    setFormError('');
    setShowModal(true);
  };

  // Close form modal
  const closeModal = () => {
    setShowModal(false);
    setEditingScreening(null);
    setFormError('');
  };

  // Handle Form Submission (Save Create / Update)
  const handleSaveScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setFormError('');
    setIsSaving(true);

    // Dynamic field validation
    const errors: ValidationErrors = {};
    if (!matchName.trim()) errors.matchName = 'Match name is required.';
    if (!venueName.trim()) errors.venueName = 'Venue name is required.';
    if (!city.trim()) errors.city = 'City selection is required.';
    if (!address.trim()) errors.address = 'Full address is required.';
    if (!screeningDatetime) {
      errors.screeningDatetime = 'Date and time are required.';
    } else if (new Date(screeningDatetime) < new Date()) {
      errors.screeningDatetime = 'Screening date must be in the future.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSaving(false);
      triggerToast('error', 'Please resolve form errors.');
      return;
    }

    const payload = {
      match_name: matchName.trim(),
      venue_name: venueName.trim(),
      city: city.trim(),
      address: address.trim(),
      screening_datetime: new Date(screeningDatetime).toISOString(),
      description: description.trim(),
      poster_image_url: posterImageUrl.trim(),
      google_maps_link: googleMapsLink.trim()
    };

    try {
      if (editingScreening) {
        const result = await updateScreeningAction(editingScreening.id, payload);
        if (result.success && result.screening) {
          setScreenings(prev =>
            prev.map(s => (s.id === editingScreening.id ? result.screening! : s))
          );
          triggerToast('success', 'Screening updated successfully.');
          closeModal();
        } else {
          setFormError(result.error || 'Failed to update screening.');
          triggerToast('error', result.error || 'Failed to update screening.');
        }
      } else {
        const result = await createScreeningAction(payload);
        if (result.success && result.screening) {
          setScreenings(prev => [result.screening!, ...prev]);
          triggerToast('success', 'Screening created successfully.');
          closeModal();
        } else {
          setFormError(result.error || 'Failed to create screening.');
          triggerToast('error', result.error || 'Failed to create screening.');
        }
      }
    } catch {
      setFormError('An error occurred while saving.');
      triggerToast('error', 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete screening action execution
  const executeDeleteScreening = async () => {
    if (!confirmDeleteScreening) return;
    setIsDeleting(true);
    
    try {
      const result = await deleteScreeningAction(confirmDeleteScreening.id);
      if (result.success) {
        setScreenings(prev => prev.filter(s => s.id !== confirmDeleteScreening.id));
        triggerToast('success', 'Screening deleted successfully.');
      } else {
        triggerToast('error', result.error || 'Failed to delete screening.');
      }
    } catch {
      triggerToast('error', 'An error occurred during deletion.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteScreening(null);
    }
  };

  // Render Login state
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 border-zinc-900 shadow-sm relative">
          <div className="text-center mb-8 flex flex-col items-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-900 text-zinc-400 mb-4">
              <Lock className="h-4.5 w-4.5" />
            </span>
            <CardTitle className="text-lg">
              Admin Login
            </CardTitle>
            <CardDescription className="mt-1">
              Enter password to access the MatchUndo dashboard.
            </CardDescription>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border-zinc-900"
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-xs font-semibold">{loginError}</p>
            )}

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-950" /> Authenticating...
                </>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Render Dashboard panel
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col relative">
      
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span>Control Panel</span>
            <span>•</span>
            <span className="text-emerald-500">Live Database</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateModal}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Create Screening
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-zinc-900"
          >
            <LogOut className="h-3.5 w-3.5 text-zinc-550" /> Logout
          </Button>
        </div>
      </div>

      {/* Screenings Watch List Table */}
      <Card className="overflow-hidden border-zinc-900">
        <CardHeader className="px-5 py-3.5 border-b border-zinc-900 bg-zinc-950/20 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-xs font-semibold text-zinc-350">Active Screenings</CardTitle>
          <span className="text-xs text-zinc-500">{screenings.length} total</span>
        </CardHeader>

        {screenings.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-550 text-[10px] font-bold uppercase tracking-wider bg-zinc-950/10">
                  <th className="py-2.5 px-5">Match Screened</th>
                  <th className="py-2.5 px-5">Venue & City</th>
                  <th className="py-2.5 px-5">Datetime</th>
                  <th className="py-2.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-xs text-zinc-350 bg-zinc-950/5">
                {screenings.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="py-3 px-5 font-semibold text-white">
                      <div>{s.match_name}</div>
                      {s.google_maps_link && (
                        <a
                          href={s.google_maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-zinc-500 hover:text-white hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          View Map <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        <span>{s.venue_name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> {s.city}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                        <span>{new Date(s.screening_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-650" />
                        <span>{new Date(s.screening_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button
                          onClick={() => openEditModal(s)}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 border-zinc-900"
                        >
                          <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                        </Button>
                        <Button
                          onClick={() => setConfirmDeleteScreening(s)}
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2 bg-red-950/20 text-red-400 border border-red-900/10 hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <p className="text-xs font-semibold">No screenings are created yet.</p>
            <p className="text-[10px] text-zinc-600 mt-1">Click the &quot;Create Screening&quot; button to add your first watch party.</p>
          </div>
        )}
      </Card>

      {/* CREATE & EDIT FORM OVERLAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 border-zinc-900 shadow-md relative my-8 bg-zinc-950">
            
            {/* Modal Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <CardTitle className="text-sm font-bold mb-6 border-b border-zinc-900 pb-2">
              {editingScreening ? 'Edit Screening Details' : 'Create New Screening'}
            </CardTitle>

            <form onSubmit={handleSaveScreening} className="space-y-4">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Match Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Match Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    placeholder="e.g. Argentina vs Brazil - Semifinal"
                    className="w-full bg-zinc-950 border-zinc-900"
                  />
                  {validationErrors.matchName && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.matchName}</span>
                  )}
                </div>

                {/* Venue Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Venue Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Kozhikode Beach Open Stage"
                    className="w-full bg-zinc-950 border-zinc-900"
                  />
                  {validationErrors.venueName && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.venueName}</span>
                  )}
                </div>

                {/* City Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-950 border-zinc-900"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Kottayam">Kottayam</option>
                  </Select>
                  {validationErrors.city && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.city}</span>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Beach Road, Kozhikode, Kerala 673032"
                    className="w-full bg-zinc-950 border-zinc-900"
                  />
                  {validationErrors.address && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.address}</span>
                  )}
                </div>

                {/* Screening Date & Time */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <DateTimePicker
                    value={screeningDatetime}
                    onChange={setScreeningDatetime}
                    error={validationErrors.screeningDatetime}
                  />
                  {validationErrors.screeningDatetime && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.screeningDatetime}</span>
                  )}
                </div>

                {/* Poster Image URL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Poster Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={posterImageUrl}
                    onChange={(e) => setPosterImageUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/poster.jpg"
                    className="w-full bg-zinc-950 border-zinc-900"
                  />
                </div>

                {/* Google Maps Link */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Google Maps Share Link (Optional)
                  </label>
                  <Input
                    type="url"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="e.g. https://maps.app.goo.gl/..."
                    className="w-full bg-zinc-950 border-zinc-900"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Screening Description
                  </label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the screening setup, sound systems, food, etc..."
                    className="w-full bg-zinc-950 border-zinc-900"
                  />
                </div>

              </div>

              {/* Form Error Banner */}
              {formError && (
                <p className="text-red-500 text-xs font-semibold">{formError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="outline"
                  size="sm"
                  className="border-zinc-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  variant="default"
                  size="sm"
                  className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-950" /> Saving...
                    </>
                  ) : (
                    'Save Screening'
                  )}
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION DIALOG MODAL */}
      {confirmDeleteScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 border-zinc-900 bg-zinc-950 relative">
            <div className="text-center mb-6 flex flex-col items-center">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/20 text-red-500 border border-red-900/10 mb-3">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <CardTitle className="text-sm font-bold text-white">
                Delete Watch Screening?
              </CardTitle>
              <CardDescription className="mt-2 text-zinc-400">
                Are you sure you want to delete the watch party for <strong className="text-zinc-200">{confirmDeleteScreening.match_name}</strong>? This action cannot be undone.
              </CardDescription>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setConfirmDeleteScreening(null)}
                variant="outline"
                size="sm"
                className="border-zinc-900 text-zinc-450 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeDeleteScreening}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-red-400" /> Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TOAST ALERT NOTIFICATIONS SYSTEM */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold shadow-md ${
            toast.type === 'success'
              ? 'bg-zinc-950 border-zinc-900 text-zinc-200'
              : 'bg-red-950/30 border-red-900/10 text-red-400'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

    </div>
  );
}
