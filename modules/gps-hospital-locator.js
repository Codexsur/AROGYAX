/**
 * GPS-based Hospital Locator for AROGYAX
 * Finds nearest hospitals and healthcare facilities using geolocation
 */

class GPSHospitalLocator {
    constructor() {
        this.userLocation = null;
        this.hospitals = [];
        this.emergencyContacts = [];
        this.mapInstance = null;
        
        this.initializeHospitalDatabase();
        this.initializeEmergencyContacts();
    }

    async initializeHospitalDatabase() {
        // Comprehensive hospital database for major Indian cities
        this.hospitals = [
            // Mumbai Hospitals
            {
                id: 1,
                name: "Tata Memorial Hospital",
                address: "Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012",
                phone: "+91-22-2417-7000",
                specialties: ["Oncology", "Cancer Treatment", "Surgery"],
                type: "Government",
                emergency: true,
                coordinates: { lat: 19.0176, lng: 72.8562 },
                city: "Mumbai",
                rating: 4.5,
                distance: 0
            },
            {
                id: 2,
                name: "Kokilaben Dhirubhai Ambani Hospital",
                address: "Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053",
                phone: "+91-22-4269-6969",
                specialties: ["Multi-specialty", "Cardiology", "Neurology"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 19.1136, lng: 72.8697 },
                city: "Mumbai",
                rating: 4.7,
                distance: 0
            },
            {
                id: 3,
                name: "Lilavati Hospital",
                address: "A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050",
                phone: "+91-22-2675-1000",
                specialties: ["Multi-specialty", "Emergency", "ICU"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 19.0596, lng: 72.8295 },
                city: "Mumbai",
                rating: 4.4,
                distance: 0
            },

            // Delhi Hospitals
            {
                id: 4,
                name: "All India Institute of Medical Sciences (AIIMS)",
                address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
                phone: "+91-11-2658-8500",
                specialties: ["Multi-specialty", "Research", "Emergency"],
                type: "Government",
                emergency: true,
                coordinates: { lat: 28.5672, lng: 77.2100 },
                city: "Delhi",
                rating: 4.6,
                distance: 0
            },
            {
                id: 5,
                name: "Fortis Hospital Shalimar Bagh",
                address: "A Block, Shalimar Bagh, Delhi 110088",
                phone: "+91-11-4713-3000",
                specialties: ["Cardiology", "Neurology", "Oncology"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 28.7196, lng: 77.1536 },
                city: "Delhi",
                rating: 4.3,
                distance: 0
            },
            {
                id: 6,
                name: "Max Super Speciality Hospital",
                address: "1, Press Enclave Road, Saket, New Delhi, Delhi 110017",
                phone: "+91-11-2651-5050",
                specialties: ["Multi-specialty", "Emergency", "Trauma"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 28.5245, lng: 77.2066 },
                city: "Delhi",
                rating: 4.5,
                distance: 0
            },

            // Bangalore Hospitals
            {
                id: 7,
                name: "Manipal Hospital",
                address: "98, Rustom Bagh, Airport Road, Bangalore, Karnataka 560017",
                phone: "+91-80-2502-4444",
                specialties: ["Multi-specialty", "Cardiology", "Neurology"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 13.0067, lng: 77.5540 },
                city: "Bangalore",
                rating: 4.4,
                distance: 0
            },
            {
                id: 8,
                name: "Apollo Hospital",
                address: "154/11, Opposite IIM-B, Bannerghatta Road, Bangalore, Karnataka 560076",
                phone: "+91-80-2630-0300",
                specialties: ["Multi-specialty", "Transplant", "Oncology"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 12.8988, lng: 77.6022 },
                city: "Bangalore",
                rating: 4.6,
                distance: 0
            },

            // Chennai Hospitals
            {
                id: 9,
                name: "Apollo Hospital Chennai",
                address: "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
                phone: "+91-44-2829-0200",
                specialties: ["Multi-specialty", "Cardiology", "Transplant"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 13.0569, lng: 80.2503 },
                city: "Chennai",
                rating: 4.5,
                distance: 0
            },
            {
                id: 10,
                name: "Fortis Malar Hospital",
                address: "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020",
                phone: "+91-44-4289-2222",
                specialties: ["Multi-specialty", "Emergency", "ICU"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 13.0067, lng: 80.2206 },
                city: "Chennai",
                rating: 4.3,
                distance: 0
            },

            // Hyderabad Hospitals
            {
                id: 11,
                name: "Apollo Hospital Hyderabad",
                address: "Road No. 72, Opp. Bharatiya Vidya Bhavan, Film Nagar, Hyderabad, Telangana 500033",
                phone: "+91-40-2355-1066",
                specialties: ["Multi-specialty", "Cardiology", "Neurology"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 17.4239, lng: 78.4738 },
                city: "Hyderabad",
                rating: 4.4,
                distance: 0
            },
            {
                id: 12,
                name: "CARE Hospital",
                address: "Road No. 1, Banjara Hills, Hyderabad, Telangana 500034",
                phone: "+91-40-6165-6565",
                specialties: ["Multi-specialty", "Emergency", "Trauma"],
                type: "Private",
                emergency: true,
                coordinates: { lat: 17.4126, lng: 78.4071 },
                city: "Hyderabad",
                rating: 4.2,
                distance: 0
            }
        ];
    }

    async initializeEmergencyContacts() {
        this.emergencyContacts = [
            {
                service: "National Emergency Number",
                number: "112",
                description: "Single emergency number for all services",
                available: "24/7"
            },
            {
                service: "Ambulance",
                number: "102",
                description: "Free ambulance service",
                available: "24/7"
            },
            {
                service: "Police",
                number: "100",
                description: "Police emergency",
                available: "24/7"
            },
            {
                service: "Fire Brigade",
                number: "101",
                description: "Fire emergency",
                available: "24/7"
            },
            {
                service: "Women Helpline",
                number: "1091",
                description: "Women in distress",
                available: "24/7"
            },
            {
                service: "Child Helpline",
                number: "1098",
                description: "Child emergency",
                available: "24/7"
            },
            {
                service: "Senior Citizen Helpline",
                number: "14567",
                description: "Elder care emergency",
                available: "24/7"
            },
            {
                service: "Mental Health Helpline",
                number: "9152987821",
                description: "Mental health crisis support",
                available: "24/7"
            }
        ];
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.userLocation);
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in kilometers
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    async findNearestHospitals(maxDistance = 50, limit = 10) {
        try {
            if (!this.userLocation) {
                await this.getCurrentLocation();
            }

            // Calculate distances and sort hospitals
            const hospitalsWithDistance = this.hospitals.map(hospital => {
                const distance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    hospital.coordinates.lat,
                    hospital.coordinates.lng
                );
                
                return {
                    ...hospital,
                    distance: distance
                };
            });

            // Filter by distance and sort
            const nearbyHospitals = hospitalsWithDistance
                .filter(hospital => hospital.distance <= maxDistance)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limit);

            return nearbyHospitals;
        } catch (error) {
            console.error('Error finding nearest hospitals:', error);
            throw error;
        }
    }

    async findHospitalsBySpecialty(specialty, maxDistance = 50) {
        try {
            const nearbyHospitals = await this.findNearestHospitals(maxDistance, 50);
            
            return nearbyHospitals.filter(hospital => 
                hospital.specialties.some(spec => 
                    spec.toLowerCase().includes(specialty.toLowerCase())
                )
            );
        } catch (error) {
            console.error('Error finding hospitals by specialty:', error);
            throw error;
        }
    }

    async findEmergencyHospitals(maxDistance = 25) {
        try {
            const nearbyHospitals = await this.findNearestHospitals(maxDistance, 20);
            
            return nearbyHospitals.filter(hospital => hospital.emergency === true);
        } catch (error) {
            console.error('Error finding emergency hospitals:', error);
            throw error;
        }
    }

    formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        } else {
            return `${distance.toFixed(1)}km`;
        }
    }

    formatHospitalInfo(hospital) {
        return {
            name: hospital.name,
            address: hospital.address,
            phone: hospital.phone,
            distance: this.formatDistance(hospital.distance),
            specialties: hospital.specialties.join(', '),
            type: hospital.type,
            emergency: hospital.emergency,
            rating: hospital.rating,
            directions: `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${hospital.coordinates.lat},${hospital.coordinates.lng}`
        };
    }

    async getDirections(hospitalId) {
        const hospital = this.hospitals.find(h => h.id === hospitalId);
        if (!hospital || !this.userLocation) {
            throw new Error('Hospital or user location not found');
        }

        const directionsUrl = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${hospital.coordinates.lat},${hospital.coordinates.lng}`;
        
        return {
            url: directionsUrl,
            hospital: hospital.name,
            estimatedTime: this.estimateTime(hospital.distance),
            distance: this.formatDistance(hospital.distance)
        };
    }

    estimateTime(distance) {
        // Rough estimation: 30 km/h average speed in city traffic
        const timeInHours = distance / 30;
        const timeInMinutes = Math.round(timeInHours * 60);
        
        if (timeInMinutes < 60) {
            return `${timeInMinutes} min`;
        } else {
            const hours = Math.floor(timeInMinutes / 60);
            const minutes = timeInMinutes % 60;
            return `${hours}h ${minutes}m`;
        }
    }

    async searchHospitals(query, maxDistance = 50) {
        try {
            const nearbyHospitals = await this.findNearestHospitals(maxDistance, 50);
            
            const searchResults = nearbyHospitals.filter(hospital => {
                const searchTerm = query.toLowerCase();
                return (
                    hospital.name.toLowerCase().includes(searchTerm) ||
                    hospital.specialties.some(spec => spec.toLowerCase().includes(searchTerm)) ||
                    hospital.address.toLowerCase().includes(searchTerm)
                );
            });

            return searchResults.map(hospital => this.formatHospitalInfo(hospital));
        } catch (error) {
            console.error('Error searching hospitals:', error);
            throw error;
        }
    }

    getEmergencyContacts() {
        return this.emergencyContacts;
    }

    async callEmergency(number) {
        // In a real app, this would initiate a phone call
        if (typeof window !== 'undefined' && window.location) {
            window.location.href = `tel:${number}`;
        }
        return { success: true, number: number };
    }

    // Integration with main AROGYAX system
    async integrateWithArogyax() {
        // Add hospital locator to global scope
        if (typeof window !== 'undefined') {
            window.hospitalLocator = this;
            
            // Add global functions for UI integration
            window.findNearestHospitals = async () => {
                try {
                    showNotification('Finding nearest hospitals...', 'info');
                    const hospitals = await this.findNearestHospitals();
                    displayHospitals(hospitals);
                } catch (error) {
                    showNotification('Error finding hospitals: ' + error.message, 'error');
                }
            };

            window.showEmergencyContacts = () => {
                displayEmergencyContacts(this.getEmergencyContacts());
            };
        }
    }
}

// UI Integration Functions
function displayHospitals(hospitals) {
    const modal = document.getElementById('hospitalLocatorModal');
    const hospitalList = document.getElementById('hospitalList');
    
    if (!hospitals || hospitals.length === 0) {
        hospitalList.innerHTML = '<p>No hospitals found in your area. Please try expanding the search radius.</p>';
        modal.style.display = 'block';
        return;
    }

    let hospitalHTML = '<div class="hospital-results">';
    
    hospitals.forEach(hospital => {
        const formattedHospital = window.hospitalLocator.formatHospitalInfo(hospital);
        hospitalHTML += `
            <div class="hospital-card">
                <div class="hospital-header">
                    <h4>${formattedHospital.name}</h4>
                    <span class="hospital-distance">${formattedHospital.distance}</span>
                </div>
                <div class="hospital-info">
                    <p><i class="fas fa-map-marker-alt"></i> ${formattedHospital.address}</p>
                    <p><i class="fas fa-phone"></i> <a href="tel:${hospital.phone}">${formattedHospital.phone}</a></p>
                    <p><i class="fas fa-stethoscope"></i> ${formattedHospital.specialties}</p>
                    <div class="hospital-meta">
                        <span class="hospital-type ${hospital.type.toLowerCase()}">${formattedHospital.type}</span>
                        ${hospital.emergency ? '<span class="emergency-badge">Emergency</span>' : ''}
                        <span class="hospital-rating">★ ${formattedHospital.rating}</span>
                    </div>
                </div>
                <div class="hospital-actions">
                    <button class="btn-primary" onclick="window.open('${formattedHospital.directions}', '_blank')">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                    <button class="btn-secondary" onclick="window.location.href='tel:${hospital.phone}'">
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
            </div>
        `;
    });
    
    hospitalHTML += '</div>';
    hospitalList.innerHTML = hospitalHTML;
    modal.style.display = 'block';
}

function displayEmergencyContacts(contacts) {
    const modal = document.getElementById('emergencyContactsModal');
    const contactsList = document.getElementById('emergencyContactsList');
    
    let contactsHTML = '<div class="emergency-contacts">';
    
    contacts.forEach(contact => {
        contactsHTML += `
            <div class="emergency-contact-card">
                <div class="contact-info">
                    <h4>${contact.service}</h4>
                    <p>${contact.description}</p>
                    <span class="availability">Available: ${contact.available}</span>
                </div>
                <div class="contact-actions">
                    <span class="emergency-number">${contact.number}</span>
                    <button class="btn-emergency" onclick="window.location.href='tel:${contact.number}'">
                        <i class="fas fa-phone"></i> Call Now
                    </button>
                </div>
            </div>
        `;
    });
    
    contactsHTML += '</div>';
    contactsList.innerHTML = contactsHTML;
    modal.style.display = 'block';
}

// Initialize GPS Hospital Locator
const gpsHospitalLocator = new GPSHospitalLocator();
gpsHospitalLocator.integrateWithArogyax();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPSHospitalLocator;
} else if (typeof window !== 'undefined') {
    window.GPSHospitalLocator = GPSHospitalLocator;
}
