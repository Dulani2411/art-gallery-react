class FavoritesService {
  static getFavorites() {
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      return favorites;
    } catch (error) {
      console.error("Error parsing favorites from localStorage:", error);
      return [];
    }
  }
  
  static getFavoritesCount() {
    return this.getFavorites().length;
  }
  
  static addToFavorites(item) {
    try {
      const favorites = this.getFavorites();
      const idToAdd = item._id || item.id;
      
      // Check if already exists in favorites
      if (!favorites.includes(idToAdd)) {
        const updatedFavorites = [...favorites, idToAdd];
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        this.notifyFavoritesUpdated();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    }
  }
  
  static removeFromFavorites(itemId) {
    try {
      const favorites = this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== itemId);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      this.notifyFavoritesUpdated();
      return updatedFavorites;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return this.getFavorites();
    }
  }
  
  static isInFavorites(itemId) {
    return this.getFavorites().includes(itemId);
  }
  
  static toggleFavorite(item) {
    const idToCheck = item._id || item.id;
    if (this.isInFavorites(idToCheck)) {
      this.removeFromFavorites(idToCheck);
      return false;
    } else {
      this.addToFavorites(item);
      return true;
    }
  }
  
  static clearFavorites() {
    try {
      localStorage.removeItem("favorites");
      this.notifyFavoritesUpdated();
    } catch (error) {
      console.error("Error clearing favorites:", error);
    }
  }
  
  static notifyFavoritesUpdated() {
    try {
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (error) {
      console.error("Error dispatching favoritesUpdated event:", error);
    }
  }
}

export default FavoritesService;