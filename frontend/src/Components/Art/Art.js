import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Art.css";
import Footer from "../Footer/Footer";
import Nav from "../Nav/Nav";

const URL = "http://localhost:5000/art";

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return { success: false, data: [] };
  }
};

function Art() {
  const [art, setArt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const location = useLocation();

  // Download PDF Report
  const downloadPDFReport = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Set document title
    doc.setFontSize(18);
    doc.text("Art Collection Report", 10, 10);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 18);

    // Prepare table data
    const tableColumn = [
      "Title", 
      "Art Type", 
      "Description", 
      "Price", 
      "Artist Name", 
      "Contact"
    ];

    const tableRows = art.map((item) => [
      item.title,
      item.artType,
      item.description || "No description",
      `Rs. ${item.price}`,
      item.artistName,
      item.gmail
    ]);

    // Use autoTable method explicitly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { 
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: { 
        description: { cellWidth: 50 } 
      }
    });

    // Save the PDF
    doc.save("art_collection_report.pdf");
  };

  // Rest of the component remains the same as in previous implementation
  useEffect(() => {
    // Extract search query from URL if present
    const params = new URLSearchParams(location.search);
    const searchFromUrl = params.get("search");
    
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setLoading(true);
      // Perform search with the URL parameter
      fetchHandler()
        .then((response) => {
          if (response && response.success && Array.isArray(response.data)) {
            const filteredArtworks = response.data.filter((artwork) =>
              Object.values(artwork).some(
                (field) =>
                  field &&
                  field.toString().toLowerCase().includes(searchFromUrl.toLowerCase())
              )
            );
            setArt(filteredArtworks);
            setNoResults(filteredArtworks.length === 0);
          } else {
            setError("Failed to load artwork data");
            console.error("Invalid data format:", response);
          }
        })
        .catch((err) => {
          setError("Error searching artwork");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Regular data loading if no search parameter
      setLoading(true);
      fetchHandler()
        .then((response) => {
          if (response && response.success && Array.isArray(response.data)) {
            setArt(response.data);
          } else {
            setError("Failed to load artwork data");
            console.error("Invalid data format:", response);
          }
        })
        .catch((err) => {
          setError("Error fetching artwork");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location.search]);

  const deleteHandler = async (id) => {
    try {
      const response = await axios.delete(`${URL}/${id}`);
      if (response.data.success) {
        setArt(art.filter((item) => item._id !== id));
      } else {
        console.error("Delete operation returned error:", response.data);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchHandler()
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const filteredArtworks = data.data.filter((artwork) =>
            Object.values(artwork).some(
              (field) =>
                field &&
                field.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
          setArt(filteredArtworks);
          setNoResults(filteredArtworks.length === 0);
        } else {
          setError("Failed to load artwork data for search");
        }
      })
      .catch((err) => {
        setError("Error searching artwork");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) return <div>Loading artwork...</div>;
  if (error) return <div>{error}</div>;

  return (
  
    <div className="art-container">
<Nav />
      <div className="search-container">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          name="search"
          placeholder="Search Artworks Details"
        />
        <button onClick={handleSearch} className="search-btn">
          Search
        </button>
      </div>

      {noResults ? (
        <div className="no-results">No results found.</div>
      ) : (
        <div className="art-gallery">
          <h2>Art Collection</h2>

          <div className="art-grid">
            {art.length > 0 ? (
              art.map((item) => (
                <div className="art-card" key={item._id}>
                  <div className="art-image">
                    {item.image && <img src={item.image} alt={item.title} />}
                  </div>
                  <div className="art-details">
                    <h3>{item.title}</h3>
                    <p className="art-type">{item.artType}</p>
                    <p className="description">{item.description}</p>
                    <p className="price">Rs. {item.price}</p>
                    <p className="artist">By: {item.artistName}</p>
                    <p className="contact">{item.gmail}</p>
                    <div className="art-actions">
                      <Link to={`/updateart/${item._id}`} className="btn update">
                        ✏️ Update
                      </Link>
                      <button
                        onClick={() => deleteHandler(item._id)}
                        className="btn delete"
                      >
                        ❌ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-art">No art found.</div>
            )}
            
          </div>
          
          <button 
            onClick={downloadPDFReport} 
            className="download-report-btn"
            disabled={art.length === 0}
          >
            Download Report
          </button>
        </div>
      )}
      <Footer/>
    </div>
  );
}

export default Art;