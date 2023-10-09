

import { formatDateWithTime } from '@components/helpers/DateUtils';  // adjust the import path as needed
import { localize } from "@translations/localize";


const diploma = async (selectedItem, dogName) => {
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
            border-radius: 25px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
    
          /* Logo */
          .logo {
            width: 300px;
            margin-bottom: 20px;
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
          <img src="https://dyremappa.no/wp-content/uploads/2023/10/icon.png" alt="Logo" class="logo">  <!-- Replace with your logo -->
          <h1>${localize('main.screens.dogDetail.rewards.diploma')}</h1>
          <div class="decorative"></div>
          <p>${localize('main.screens.dogDetail.rewards.awardedTo')}</p>
          <h2>${dogName}</h2>
          <p>${localize('main.screens.dogDetail.rewards.for')}</p>
          <h3>${selectedItem.get('title')}</h3>
          <p>${selectedItem.get('desc') ? selectedItem.get('desc') : ''}</p>
          <p>Dato: ${formatDateWithTime(selectedItem.get('date'))}</p>
        </div>
      </body>
    </html>`;
  
    return HTML;
};

export default diploma;
