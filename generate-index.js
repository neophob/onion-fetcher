const fs = require('fs');
const path = require('path');

// Get the output directory from the command-line argument
const outputDir = process.argv[2]; // e.g., "output"

// Check if output directory is provided
if (!outputDir) {
  console.error('Please specify the output directory, e.g., node generate-index.js output');
  process.exit(1);
}

// Read the directory and filter for PNG files
fs.readdir(outputDir, (err, files) => {
  if (err) {
    console.error('Error reading images directory:', err);
    return;
  }

  // Filter for PNG files
  const images = files.filter(file => file.endsWith('.png'));

  if (images.length === 0) {
    console.error('No PNG images found in the images directory.');
    return;
  }

  // Ensure the output directory exists, create if not
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Start generating HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image Gallery</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 20px;
        }
        .image-container {
          position: relative;
          overflow: hidden;
          height: 500px; /* Cap the height to 500px */
        }
        .image {
          width: 100%;  /* Make the image width 100% of the container */
          height: auto; /* Maintain aspect ratio */
          max-height: 500px; /* Cap the height to 500px */
          object-fit: none; /* Allow image to overflow horizontally */
          object-position: top; /* Ensure the top of the image is visible */
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .image:hover {
          transform: scale(1.05); /* Zoom in horizontally on hover */
        }
        .image-fullscreen {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          justify-content: center;
          align-items: flex-start; /* Align top of image to top of the screen */
          z-index: 1000;
          overflow: auto; /* Allow scrolling if the image is taller than the screen */
        }
        .image-fullscreen img {
          width: auto; /* Display the image in its natural width */
          max-width: 100%; /* Ensure the image doesn't exceed the viewport width */
          height: auto; /* Allow the height to scale with the aspect ratio */
          object-fit: contain; /* Ensure the image fits within the viewport */
        }
      </style>
    </head>
    <body>
      <div class="gallery">
  `;

  // Add each image to the HTML
  images.forEach(image => {
    const imagePath = `${image}`; // Update this if you need to adjust the path
    htmlContent += `
      <div class="image-container">
        <img src="${imagePath}" alt="${image}" class="image">
      </div>
    `;
  });

  // End the gallery and add the fullscreen functionality
  htmlContent += `
      </div>
      <div class="image-fullscreen" id="fullscreenModal">
        <img src="" alt="Fullscreen Image" id="fullscreenImage">
      </div>
      <script>
        const images = document.querySelectorAll('.image');
        const fullscreenModal = document.getElementById('fullscreenModal');
        const fullscreenImage = document.getElementById('fullscreenImage');

        // Click on image to open in fullscreen
        images.forEach(img => {
          img.addEventListener('click', (e) => {
            const src = e.target.src;
            fullscreenImage.src = src;
            fullscreenModal.style.display = 'flex';
          });
        });

        // Close fullscreen view when clicking outside the image
        fullscreenModal.addEventListener('click', (e) => {
          if (e.target === fullscreenModal) {
            fullscreenModal.style.display = 'none';
          }
        });
      </script>
    </body>
    </html>
  `;

  // Define the path for the output HTML file
  const outputFilePath = path.join(outputDir, 'index.html');

  // Write the HTML content to the output file
  fs.writeFile(outputFilePath, htmlContent, (err) => {
    if (err) {
      console.error('Error writing HTML file:', err);
    } else {
      console.log(`index.html has been created successfully in the "${outputDir}" directory!`);
    }
  });
});