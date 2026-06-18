"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { submitScreeningAction, getApprovedVenuesAction } from "@/app/actions";
import { trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ArrowRight, Loader2, AlertCircle, Info } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { VenueSelector } from "@/components/VenueSelector";
import { type VenueInfo } from "@/lib/venue";
import { Turnstile } from "@/components/Turnstile";

export default function SubmitScreeningPage() {
  const [venues, setVenues] = useState<VenueInfo[]>([]);

  // Page load event tracking
  useEffect(() => {
    trackPageView("/submit");
    getApprovedVenuesAction().then((data) => {
      setVenues(data);
    });
  }, []);

  // Form states
  const [matchName, setMatchName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [citySelection, setCitySelection] = useState("Kochi");
  const [customCity, setCustomCity] = useState("");
  const [address, setAddress] = useState("");
  const [screeningDatetime, setScreeningDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [submittedByName, setSubmittedByName] = useState("");
  const [submittedByEmail, setSubmittedByEmail] = useState("");
  const [sport, setSport] = useState("Football");
  const [customSport, setCustomSport] = useState("");
  const [competition, setCompetition] = useState("");
  const [customCompetition, setCustomCompetition] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState("");

  // UI state
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Cities selection list
  const cities = [
    "Kochi", "Trivandrum", "Kozhikode", "Thrissur", "Kannur",
    "Kasaragod", "Palakkad", "Malappuram", "Kottayam", "Alappuzha",
    "Pathanamthitta", "Kollam", "Idukki", "Wayanad", "Ernakulam", "Other"
  ];

  const competitions = [
    "IPL", "ISL", "Premier League", "UEFA Champions League",
    "FIFA World Cup", "Cricket World Cup", "Other"
  ];

  // Helper validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!matchName.trim()) errors.matchName = "Match name is required";
    if (!venueName.trim()) errors.venueName = "Venue name is required";
    if (sport === "Other" && !customSport.trim()) {
      errors.sport = "Please specify the sport name";
    }
    
    const finalCity = citySelection === "Other" ? customCity : citySelection;
    if (!finalCity.trim()) errors.city = "City is required";
    
    if (!address.trim()) errors.address = "Venue address is required";
    if (!screeningDatetime) {
      errors.screeningDatetime = "Screening date and time are required";
    } else if (new Date(screeningDatetime) < new Date()) {
      errors.screeningDatetime = "Screening date must be in the future.";
    }
    if (!submittedByName.trim()) errors.submittedByName = "Your name is required";
    
    if (notifyByEmail && !submittedByEmail.trim()) {
      errors.submittedByEmail = "Email is required if you want review notifications.";
    } else if (submittedByEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(submittedByEmail)) {
        errors.submittedByEmail = "Please enter a valid email address";
      }
    }

    if (googleMapsLink.trim()) {
      if (!googleMapsLink.startsWith("http://") && !googleMapsLink.startsWith("https://")) {
        errors.googleMapsLink = "Please enter a valid URL (starting with http:// or https://)";
      }
    }

    if (competition === "Other" && !customCompetition.trim()) {
      errors.competition = "Please specify the competition name";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) {
      setErrorMsg("Please fill out all required fields correctly.");
      return;
    }

    setIsPending(true);

    const finalCity = citySelection === "Other" ? customCity : citySelection;
    const finalSport = sport === "Other" ? customSport : sport;
    const finalCompetition = competition === "Other" ? customCompetition : competition;

    try {
      const response = await submitScreeningAction({
        match_name: matchName.trim(),
        venue_name: venueName.trim(),
        city: finalCity.trim(),
        address: address.trim(),
        screening_datetime: screeningDatetime,
        description: description.trim(),
        poster_image_url: "",
        google_maps_link: googleMapsLink.trim(),
        submitted_by_name: submittedByName.trim(),
        submitted_by_email: submittedByEmail.trim() || undefined,
        sport: finalSport.trim() || undefined,
        competition: finalCompetition.trim() || undefined,
        notify_by_email: notifyByEmail,
      }, turnstileToken);

      if (response.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(response.error || "An error occurred while submitting. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to submit screening. Please check your network connection.");
    } finally {
      setIsPending(false);
    }
  };

  const handleReset = () => {
    setMatchName("");
    setVenueName("");
    setCitySelection("Kochi");
    setCustomCity("");
    setAddress("");
    setScreeningDatetime("");
    setDescription("");
    setGoogleMapsLink("");
    setSubmittedByName("");
    setSubmittedByEmail("");
    setSport("Football");
    setCustomSport("");
    setCompetition("");
    setCustomCompetition("");
    setNotifyByEmail(true);
    setErrorMsg("");
    setValidationErrors({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 flex-1 flex flex-col justify-center items-center">
        <Card className="w-full border-zinc-900 bg-zinc-950 p-8 text-center flex flex-col items-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/20 text-emerald-500 border border-emerald-900/10 mb-4 animate-in zoom-in-50 duration-300">
            <CheckCircle className="h-6 w-6" />
          </div>
          
          <CardTitle className="text-lg font-bold text-white mb-2">
            Watch Screening Submitted!
          </CardTitle>
          
          <CardDescription className="text-zinc-400 text-xs leading-relaxed mb-6">
            Thank you for submitting <strong className="text-zinc-200">{matchName}</strong> at <strong className="text-zinc-200">{venueName}</strong>. Our moderation team will review the details. Once approved, the watch party will be live on MatchUndo.
          </CardDescription>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-900 text-xs"
            >
              Submit Another
            </Button>
            <Link href="/screenings" className="flex-1">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs flex items-center justify-center gap-1.5"
              >
                Browse Screenings <ArrowRight className="h-3 w-3 text-zinc-950" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 sm:px-6 py-10 flex-1 flex flex-col justify-center">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Submit a Screening
        </h1>
        <p className="text-zinc-550 text-[11px] mt-1">
          Help the community find public match screenings in Kerala.
        </p>
      </div>

      <Card className="border-zinc-900 bg-zinc-950 shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-zinc-900/60 bg-zinc-950">
          <div className="flex gap-2.5 text-[11px] text-zinc-400">
            <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Required fields are marked with <span className="text-red-500">*</span>. All submitted screenings undergo approval review before showing up in search and list views.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Match Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Match / Event Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder="e.g. Argentina vs France"
                className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
              />
              {validationErrors.matchName && (
                <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.matchName}</span>
              )}
            </div>

            {/* Sport & Competition Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Sport <span className="text-zinc-650">(Optional)</span>
                </label>
                <Select
                  value={sport}
                  onChange={(e) => {
                    setSport(e.target.value);
                    if (e.target.value !== "Other") setCustomSport("");
                  }}
                  className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                >
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Formula 1">Formula 1</option>
                  <option value="Kabaddi">Kabaddi</option>
                  <option value="Esports">Esports</option>
                  <option value="Other">Other (Specify)</option>
                </Select>
                {validationErrors.sport && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.sport}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Competition <span className="text-zinc-650">(Optional)</span>
                </label>
                <Select
                  value={competition}
                  onChange={(e) => {
                    setCompetition(e.target.value);
                    if (e.target.value !== "Other") setCustomCompetition("");
                  }}
                  className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                >
                  <option value="">Select Competition</option>
                  {competitions.map((comp) => (
                    <option key={comp} value={comp} className="bg-zinc-950 text-white">
                      {comp}
                    </option>
                  ))}
                </Select>
                {validationErrors.competition && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.competition}</span>
                )}
              </div>
            </div>

            {/* Custom Sport / Competition row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Custom Sport (Conditional input) */}
              {sport === "Other" && (
                <div className="animate-in slide-in-from-top-1 duration-150">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Specify Sport Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={customSport}
                    onChange={(e) => setCustomSport(e.target.value)}
                    placeholder="e.g. Badminton"
                    className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                  />
                </div>
              )}

              {/* Custom Competition (Conditional input) */}
              {competition === "Other" && (
                <div className="animate-in slide-in-from-top-1 duration-150">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Specify Competition <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={customCompetition}
                    onChange={(e) => setCustomCompetition(e.target.value)}
                    placeholder="e.g. La Liga"
                    className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                  />
                </div>
              )}
            </div>

            {/* Venue Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Venue Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <VenueSelector
                  venues={venues}
                  value={venueName}
                  onChange={setVenueName}
                  onSelectVenue={(venue) => {
                    setVenueName(venue.venueName);
                    setAddress(venue.address);
                    if (venue.googleMapsLink) setGoogleMapsLink(venue.googleMapsLink);
                    
                    const predefinedCities = [
                      "Kochi", "Trivandrum", "Kozhikode", "Thrissur", "Kannur",
                      "Kasaragod", "Palakkad", "Malappuram", "Kottayam", "Alappuzha",
                      "Pathanamthitta", "Kollam", "Idukki", "Wayanad", "Ernakulam"
                    ];
                    
                    if (predefinedCities.includes(venue.city)) {
                      setCitySelection(venue.city);
                      setCustomCity("");
                    } else {
                      setCitySelection("Other");
                      setCustomCity(venue.city);
                    }
                  }}
                  placeholder="Search or enter venue..."
                />
                {validationErrors.venueName && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.venueName}</span>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Select City <span className="text-red-500">*</span>
                </label>
                <Select
                  value={citySelection}
                  onChange={(e) => {
                    setCitySelection(e.target.value);
                    if (e.target.value !== "Other") setCustomCity("");
                  }}
                  className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                >
                  {cities.map((city) => (
                    <option key={city} value={city} className="bg-zinc-950 text-white">
                      {city}
                    </option>
                  ))}
                </Select>
              </div>

            </div>

            {/* Custom City (Conditional input) */}
            {citySelection === "Other" && (
              <div className="animate-in slide-in-from-top-1 duration-150">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Specify City Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. Alappuzha"
                  className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                />
                {validationErrors.city && (
                  <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.city}</span>
                )}
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Venue Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Mahatma Gandhi Road, Near Metro Pillar 120"
                className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
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
                <span className="text-[10px] text-red-500 font-medium mt-1.5 block">{validationErrors.screeningDatetime}</span>
              )}
            </div>

            {/* Google Maps Link */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Google Maps Link (Optional)
              </label>
              <Input
                type="text"
                value={googleMapsLink}
                onChange={(e) => setGoogleMapsLink(e.target.value)}
                placeholder="e.g. https://maps.app.goo.gl/..."
                className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
              />
              {validationErrors.googleMapsLink && (
                <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.googleMapsLink}</span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Description (Optional)
              </label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify entry details, screen setups, sound quality, foods/beverages, etc..."
                className="w-full bg-zinc-950 border-zinc-900 text-xs"
              />
            </div>

            {/* Submitter Info Section */}
            <div className="border-t border-zinc-900/80 pt-4 mt-6">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-405 mb-3">
                Your Contact Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Submitter Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={submittedByName}
                    onChange={(e) => setSubmittedByName(e.target.value)}
                    placeholder="e.g. Umar Al Mukhtar"
                    className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                  />
                  {validationErrors.submittedByName && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.submittedByName}</span>
                  )}
                </div>

                {/* Submitter Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Email Address {notifyByEmail ? <span className="text-red-500">*</span> : <span className="text-zinc-650">(Optional)</span>}
                  </label>
                  <Input
                    type="email"
                    required={notifyByEmail}
                    value={submittedByEmail}
                    onChange={(e) => setSubmittedByEmail(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                  />
                  {validationErrors.submittedByEmail && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.submittedByEmail}</span>
                  )}
                </div>

              </div>

              {/* Notify By Email Checkbox */}
              <div className="flex items-center gap-2 mt-4 py-1">
                <input
                  type="checkbox"
                  id="notifyByEmail"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-900 bg-zinc-950 accent-zinc-100 focus:ring-1 focus:ring-zinc-800 text-zinc-950 cursor-pointer"
                />
                <label
                  htmlFor="notifyByEmail"
                  className="text-xs text-zinc-400 select-none cursor-pointer"
                >
                  Notify me by email when this submission is reviewed
                </label>
              </div>
            </div>

            {/* Turnstile Widget */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="py-2 border-t border-zinc-900/40">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Security Verification <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center sm:justify-start">
                  <Turnstile onVerify={setTurnstileToken} />
                </div>
              </div>
            )}

            {/* Submission Error message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/20 border border-red-900/10 text-red-400 rounded-lg flex items-start gap-2 text-[11px] animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900/80">
              <Link href="/screenings" className="w-24">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-900 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                variant="default"
                size="sm"
                className="w-32 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-zinc-950 mr-1" /> Submitting...
                  </>
                ) : (
                  "Submit Watch"
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
