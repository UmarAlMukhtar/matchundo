'use client';

import { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AdminPanelProps {
  initialAuthenticated: boolean;
  initialScreenings: Screening[];
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
  const [formError, setFormError] = useState('');

  // Form Fields
  const [matchName, setMatchName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('Kochi');
  const [address, setAddress] = useState('');
  const [screeningDatetime, setScreeningDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

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
      } else {
        setLoginError(result.error || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Error connecting to authentication action.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logoutAdmin();
        setIsAuthenticated(false);
        setPassword('');
      } catch (error) {
        console.error('Logout error:', error);
      }
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
    setFormError('');
    setShowModal(true);
  };

  // Close form modal
  const closeModal = () => {
    setShowModal(false);
    setEditingScreening(null);
  };

  // Handle Form Submission (Save Create / Update)
  const handleSaveScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    if (!matchName || !venueName || !city || !address || !screeningDatetime) {
      setFormError('Please fill in all required fields.');
      setIsSaving(false);
      return;
    }

    const payload = {
      match_name: matchName,
      venue_name: venueName,
      city,
      address,
      screening_datetime: new Date(screeningDatetime).toISOString(),
      description,
      poster_image_url: posterImageUrl,
      google_maps_link: googleMapsLink
    };

    try {
      if (editingScreening) {
        const result = await updateScreeningAction(editingScreening.id, payload);
        if (result.success && result.screening) {
          setScreenings(prev =>
            prev.map(s => (s.id === editingScreening.id ? result.screening! : s))
          );
          closeModal();
        } else {
          setFormError(result.error || 'Failed to update screening.');
        }
      } else {
        const result = await createScreeningAction(payload);
        if (result.success && result.screening) {
          setScreenings(prev => [result.screening!, ...prev]);
          closeModal();
        } else {
          setFormError(result.error || 'Failed to create screening.');
        }
      }
    } catch (error) {
      console.error('Save screening error:', error);
      setFormError('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Screening Delete
  const handleDeleteScreening = async (id: string, matchNameText: string) => {
    if (confirm(`Are you sure you want to delete the screening for "${matchNameText}"?`)) {
      try {
        const result = await deleteScreeningAction(id);
        if (result.success) {
          setScreenings(prev => prev.filter(s => s.id !== id));
        } else {
          alert(result.error || 'Failed to delete screening.');
        }
      } catch (error) {
        console.error('Delete screening error:', error);
        alert('An error occurred during deletion.');
      }
    }
  };

  // Render Login state
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 border-zinc-850 relative">
          <div className="text-center mb-8 flex flex-col items-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 mb-4">
              <Lock className="h-5 w-5" />
            </span>
            <CardTitle className="text-xl">
              Admin Login
            </CardTitle>
            <CardDescription className="mt-1">
              Enter password to access the MatchUndo dashboard.
            </CardDescription>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950"
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-xs font-semibold">{loginError}</p>
            )}

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-900" /> Authenticating...
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
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-550 font-medium">
            <span>Control Panel</span>
            <span>•</span>
            <span className="text-emerald-500">Live Database</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateModal}
            variant="default"
            className="flex items-center gap-1.5 h-9 px-4"
          >
            <Plus className="h-4 w-4" /> Create Screening
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-1.5 h-9 px-4 border-zinc-850"
          >
            <LogOut className="h-4 w-4 text-zinc-400" /> Logout
          </Button>
        </div>
      </div>

      {/* Screenings Watch List Table */}
      <Card className="overflow-hidden border-zinc-850">
        <CardHeader className="px-6 py-4 border-b border-zinc-900 bg-zinc-950 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-sm font-semibold">Active Screenings</CardTitle>
          <span className="text-xs text-zinc-550">{screenings.length} total</span>
        </CardHeader>

        {screenings.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-bold uppercase tracking-wider bg-zinc-950/20">
                  <th className="py-3 px-6">Match Screened</th>
                  <th className="py-3 px-6">Venue & City</th>
                  <th className="py-3 px-6">Datetime</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-xs text-zinc-300">
                {screenings.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{s.match_name}</div>
                      {s.google_maps_link && (
                        <a
                          href={s.google_maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-zinc-500 hover:text-white hover:underline inline-flex items-center gap-0.5 mt-1"
                        >
                          View Map <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-zinc-350">
                        <span>{s.venue_name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-550 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {s.city}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-zinc-350">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{new Date(s.screening_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                      </div>
                      <div className="text-[10px] text-zinc-550 mt-1 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{new Date(s.screening_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button
                          onClick={() => openEditModal(s)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 border-zinc-850"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteScreening(s.id, s.match_name)}
                          variant="destructive"
                          size="sm"
                          className="h-8 px-2"
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
            <p className="text-[11px] text-zinc-600 mt-1">Click the &quot;Create Screening&quot; button to add your first football match watch party.</p>
          </div>
        )}
      </Card>

      {/* CREATE & EDIT FORM OVERLAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 sm:p-8 border-zinc-850 shadow-2xl relative my-8">
            
            {/* Modal Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-900 text-zinc-450 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <CardTitle className="text-xl mb-6">
              {editingScreening ? 'Edit Screening Details' : 'Create New Screening'}
            </CardTitle>

            <form onSubmit={handleSaveScreening} className="space-y-6">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Match Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Match Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    placeholder="e.g. Argentina vs Brazil - Semifinal"
                    className="w-full bg-zinc-950"
                  />
                </div>

                {/* Venue Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Venue Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Kozhikode Beach Open Stage"
                    className="w-full bg-zinc-950"
                  />
                </div>

                {/* City Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-950"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Kottayam">Kottayam</option>
                  </Select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Beach Road, Kozhikode, Kerala 673032"
                    className="w-full bg-zinc-950"
                  />
                </div>

                {/* Screening Date & Time */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={screeningDatetime}
                    onChange={(e) => setScreeningDatetime(e.target.value)}
                    className="w-full bg-zinc-950 text-zinc-400"
                  />
                </div>

                {/* Poster Image URL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Poster Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={posterImageUrl}
                    onChange={(e) => setPosterImageUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/poster.jpg"
                    className="w-full bg-zinc-950"
                  />
                </div>

                {/* Google Maps Link */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Google Maps Share Link (Optional)
                  </label>
                  <Input
                    type="url"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="e.g. https://maps.app.goo.gl/..."
                    className="w-full bg-zinc-950"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Screening Description
                  </label>
                  <Textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the screening setup, screens, sound systems, etc..."
                    className="w-full bg-zinc-950"
                  />
                </div>

              </div>

              {/* Form Error Banner */}
              {formError && (
                <p className="text-red-500 text-xs font-semibold">{formError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="outline"
                  className="border-zinc-850"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-900" /> Saving...
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

    </div>
  );
}
