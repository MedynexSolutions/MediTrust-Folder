import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const popularCities = [
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.385, lng: 78.4867 },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.8777 },
  { name: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', lat: 16.5062, lng: 80.6480 },
  { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { name: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
];

export default function MapLocationPicker({ onLocationSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const filteredCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    const location = {
      country: city.country,
      state: city.state,
      city: city.name,
      lat: city.lat,
      lng: city.lng
    };
    localStorage.setItem('meditrust_location', JSON.stringify(location));
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo, select nearest city from list
          const nearest = popularCities[0]; // In real app, calculate nearest
          handleCitySelect(nearest);
          setIsSearching(false);
        },
        (error) => {
          alert('Unable to get your location. Please select manually.');
          setIsSearching(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-sky-500 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Select Location</h2>
            <button onClick={onClose} className="text-white/90 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city or area..."
              className="pl-10 h-10 bg-white/90 border-0"
            />
          </div>
        </div>

        {/* Current Location Button */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={handleCurrentLocation}
            disabled={isSearching}
            className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">
                {isSearching ? 'Getting location...' : 'Use Current Location'}
              </p>
              <p className="text-xs text-gray-500">Auto-detect your city</p>
            </div>
          </button>
        </div>

        {/* Cities List */}
        <div className="p-4 overflow-y-auto max-h-96">
          <p className="text-sm font-semibold text-gray-600 mb-3">Popular Cities</p>
          <div className="space-y-2">
            {filteredCities.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedCity?.name === city.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedCity?.name === city.name ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <MapPin className={`w-5 h-5 ${
                    selectedCity?.name === city.name ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{city.name}</p>
                  <p className="text-xs text-gray-500">{city.state}, {city.country}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        {selectedCity && (
          <div className="p-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl"
            >
              Confirm Location
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}