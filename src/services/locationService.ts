// Location-based functionality

/**
 * Interface for location data
 */
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Interface for place suggestion
 */
interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  category: string;
  distance: number; // in meters
  isFavorite?: boolean;
}

/**
 * Location Service for handling geolocation and place suggestions
 */
export class LocationService {
  /**
   * Check if geolocation is available in the browser
   */
  static isGeolocationAvailable(): boolean {
    return "geolocation" in navigator;
  }

  /**
   * Get the current location
   */
  static async getCurrentLocation(): Promise<LocationData> {
    if (!this.isGeolocationAvailable()) {
      throw new Error("Geolocation is not supported by your browser");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(new Error(`Error getting location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }

  /**
   * Get nearby places based on current location
   * In a real app, this would call a Places API like Google Places
   */
  static async getNearbyPlaces(
    location: LocationData,
    category?: string,
  ): Promise<PlaceSuggestion[]> {
    // This is a mock implementation - in a real app, you would call an external API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    // Create mock data based on the category
    const mockPlaces: PlaceSuggestion[] = [];

    // Different mock places based on category
    if (category === "restaurant" || category === "dining") {
      mockPlaces.push(
        {
          id: "1",
          name: "Local Bistro",
          address: "123 Main St",
          category: "Restaurant",
          distance: 350,
          isFavorite: true,
        },
        {
          id: "2",
          name: "Pizza Palace",
          address: "456 Oak Ave",
          category: "Restaurant",
          distance: 650,
        },
        {
          id: "3",
          name: "Sushi Express",
          address: "789 Maple Blvd",
          category: "Restaurant",
          distance: 820,
        },
      );
    } else if (category === "grocery" || category === "groceries") {
      mockPlaces.push(
        {
          id: "4",
          name: "Fresh Market",
          address: "210 Cedar St",
          category: "Grocery",
          distance: 450,
        },
        {
          id: "5",
          name: "Organic Goods",
          address: "567 Pine Ave",
          category: "Grocery",
          distance: 750,
          isFavorite: true,
        },
      );
    } else if (category === "gas" || category === "fuel") {
      mockPlaces.push(
        {
          id: "6",
          name: "QuickFuel",
          address: "890 Elm St",
          category: "Gas Station",
          distance: 300,
        },
        {
          id: "7",
          name: "GasNGo",
          address: "432 Walnut Ave",
          category: "Gas Station",
          distance: 650,
        },
      );
    } else {
      // Default places
      mockPlaces.push(
        {
          id: "8",
          name: "Shopping Mall",
          address: "100 Commerce Way",
          category: "Shopping",
          distance: 1200,
        },
        {
          id: "9",
          name: "Coffee Shop",
          address: "321 Barista Lane",
          category: "Café",
          distance: 280,
          isFavorite: true,
        },
        {
          id: "10",
          name: "Movie Theater",
          address: "555 Entertainment Blvd",
          category: "Entertainment",
          distance: 1800,
        },
      );
    }

    // Sort by distance
    return mockPlaces.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find frequently visited places based on transaction history
   * In a real app, this would analyze the user's transaction patterns
   */
  static getFrequentPlaces(): PlaceSuggestion[] {
    // Mock implementation
    return [
      {
        id: "11",
        name: "Coffee Corner",
        address: "123 Brew St",
        category: "Café",
        distance: 0, // Distance unknown when not using current location
        isFavorite: true,
      },
      {
        id: "12",
        name: "Local Grocery",
        address: "456 Food Ave",
        category: "Grocery",
        distance: 0,
        isFavorite: true,
      },
      {
        id: "13",
        name: "Daily Commute Gas",
        address: "789 Fuel Blvd",
        category: "Gas Station",
        distance: 0,
      },
    ];
  }

  /**
   * Reverse geocode to get address from coordinates
   * In a real app, this would use a geocoding service like Google Maps
   */
  static async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
    return "123 Example Street, City, State";
  }

  /**
   * Save a place as favorite
   */
  static async saveFavoritePlace(place: PlaceSuggestion): Promise<void> {
    // In a real app, this would save to a database
    console.log("Saving favorite place:", place);
    // Mock successful save
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  /**
   * Remove a place from favorites
   */
  static async removeFavoritePlace(placeId: string): Promise<void> {
    // In a real app, this would remove from a database
    console.log("Removing favorite place:", placeId);
    // Mock successful removal
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

export default LocationService;
