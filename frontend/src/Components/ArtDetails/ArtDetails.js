import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ArtDetail.css'; // Make sure this matches your CSS file name
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// If you're not using Footer in this component, you can remove the import
// import Footer from '../Footer/Footer';

function ArtDetail({ art }) {
  // Add a check for if art is undefined or null
  if (!art) {
    return <div className="loading">Loading art details...</div>;
  }
  
  const { _id, artType, description, price, artistName, gmail, image } = art;
  const navigate = useNavigate();
  
  const deleteHandler = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/art/${_id}`);
      if (response.data.success) {
        // Navigate to the art collection page after successful deletion
        navigate('/mainart');
      } else {
        console.error("Delete operation returned error:", response.data);
      }
    } catch (error) {
      console.error("Error deleting artwork:", error);
      // You could add error handling UI here
    }
  };

  // Function to download PDF with image
  const downloadPDF = () => {
    // Show a loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.innerHTML = 'Generating PDF...';
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.background = 'rgba(255, 255, 255, 0.9)';
    loadingMessage.style.borderRadius = '10px';
    loadingMessage.style.zIndex = '9999';
    document.body.appendChild(loadingMessage);
    
    // Get the element to convert to PDF
    const artElement = document.getElementById('art-detail-content');
    
    // First create a canvas from the DOM element
    html2canvas(artElement, {
      allowTaint: true,
      useCORS: true, // This is important for handling cross-origin images
      scale: 2, // Higher scale for better quality
      logging: true, // For debugging
      onclone: (document) => {
        // You can modify the cloned document before rendering if needed
        const content = document.getElementById('art-detail-content');
        if (content) {
          // Ensure the content is visible
          content.style.display = 'flex';
        }
      }
    }).then(canvas => {
      // Remove the loading message
      document.body.removeChild(loadingMessage);
      
      const imgData = canvas.toDataURL('image/png');
      
      // Initialize PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(artType || 'Art Details', pdfWidth / 2, 20, { align: 'center' });
      
      // Add image
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Add metadata at the bottom
      pdf.setFontSize(10);
      pdf.text(`Downloaded on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(`${artType || 'art'}-details.pdf`);
    }).catch(err => {
      // Remove the loading message
      document.body.removeChild(loadingMessage);
      
      console.error('Error generating PDF:', err);
      alert('Could not generate PDF. Please make sure the artwork image is accessible.');
    });
  };
  
  return (
    <div className="art-details-container">
      <div className="art-details-card" id="art-detail-content">
        <div className="art-details-image">
          <img 
            src={image || "https://via.placeholder.com/300"}
            alt={artType}
            className="detail-image"
            crossOrigin="anonymous" // Important for handling cross-origin images
          />
        </div>
        
        <div className="art-details-content">
          <h1 className="art-detail-title">{artType}</h1>
          
          <div className="art-detail-info">
            <p className="art-detail-description">{description}</p>
            <p className="art-detail-price">Price: <span>Rs. {price}</span></p>
            <p className="art-detail-artist">Created by: <span>{artistName}</span></p>
            <p className="art-detail-contact">Contact: <span>{gmail}</span></p>
            <p className="art-detail-id">Art ID: <span>{_id}</span></p>
          </div>
        </div>
      </div>
      
      <div className="art-detail-actions">
        <Link to={`/mainaddart/${_id}`} className="update-btn">
          Edit Artwork
        </Link>
        <button onClick={deleteHandler} className="delete-btn">
          Delete Artwork
        </button>
        <button onClick={downloadPDF} className="download-btn">
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default ArtDetail;