

import { formatDateWithTime } from '@components/helpers/DateUtils';  // adjust the import path as needed
import { localize } from "@translations/localize";


const missing = async (data) => {
    const HTML = `<!DOCTYPE html>
    <html>
      <head>
        <title>${localize('main.screens.dogDetail.rewards.diploma')}</title>
        <style>
          /* General styles */
          body {
            font-family: 'San Francisco', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            text-align: center;
            margin: 50px;
          }
    
          /* Container for better alignment and rounded box */
          .container {
            max-width: 600px;
            background-color: #fff;
            margin: auto;
            padding: 50px;
          }
    
          /* Logo */
          .logo {
            width: 150px;
            margin-bottom: 20px;
          }
          .image {
            margin-bottom: 20px;
            height: 350px;
            max-height: 350px;
          }
    
          /* Title */
          h1 {
            font-size: 2.5em;
            color: #444;
            margin-bottom: 20px;
          }
    
          /* Subtitle and Details */
          h2, h3, p {
            margin: 20px 0;
            color: #666;
          }
    
          /* Dog Name */
          h2 {
            font-size: 2em;
            color: #333;
          }
    
          /* Award Title */
          h3 {
            font-size: 1.5em;
          }
    
          /* Description and Date */
          p {
            font-size: 1.2em;
          }
    
          /* Decorative elements */
          .decorative {
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, rgba(0,0,0,0) 0%, #444 50%, rgba(0,0,0,0) 100%);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
        <img src="${data.get('profileImage').url()}" alt="Logo" class="image">  <!-- Replace with your logo -->
          <h1>${localize('main.screens.dogDetail.missing.pdf.title')}</h1>
          <div class="decorative"></div>
          <p>${localize('main.screens.dogDetail.missing.pdf.haveYouSeen')}</p>
          <h2>${data.get('title')}</h2>
          <p>${localize('main.screens.dogDetail.missing.pdf.description')}</p>
          <p>${data.get('desc') ? data.get('desc') : ''}</p>
          <p>${data.get('breed') ? data.get('breed') : ''}</p>
          <img src="https://dyremappa.no/wp-content/uploads/2023/10/icon.png" alt="Logo" class="logo">  <!-- Replace with your logo -->
        </div>
      </body>
    </html>`;
  
    return HTML;
};

export default missing;
