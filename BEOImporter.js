import { useState } from 'react';
import { hotBuffetItems } from '../lib/hotBuffet';
import { coldBuffetItems } from '../lib/coldBuffet';
import { beverageItems } from '../lib/beverages';
import { coffeeBreakItems } from '../lib/coffeeBreak';
import { snackItems } from '../lib/snacks';
import { stationItems } from '../lib/stations';
import { dessertItems } from '../lib/desserts';

const BEOImporter = ({ setTaggedItems }) => {
  const [beoText, setBeoText] = useState('');
  const allFoodItems = {
    ...hotBuffetItems,
    ...coldBuffetItems,
    ...beverageItems,
    ...coffeeBreakItems,
    ...snackItems,
    ...stationItems,
    ...dessertItems,
  };

  const handleImport = () => {
    const lines = beoText.split('\n');
    const newItems = [];
    lines.forEach(line => {
      Object.keys(allFoodItems).forEach(category => {
        allFoodItems[category].forEach(item => {
          if (line.toLowerCase().includes(item.toLowerCase())) {
            newItems.push({ category, item });
          }
        });
      });
    });
    setTaggedItems(newItems);
  };

  return (
    <div id="beo-importer-tab-view">
      <p className="text-gray-600 mb-4">Paste your BEO text below or upload a .txt file. The app will find known items and add them to this event.</p>
      <textarea
        id="beo-textarea-editor"
        className="w-full h-64 p-3 border border-gray-300 rounded-md"
        placeholder="Paste your BEO or menu here..."
        value={beoText}
        onChange={(e) => setBeoText(e.target.value)}
      ></textarea>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <label htmlFor="beo-file-upload-editor" className="cursor-pointer rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700">Upload .txt File</label>
          <input id="beo-file-upload-editor" type="file" accept=".txt" />
          <span id="beo-file-name-editor" className="ml-3 text-sm text-gray-500"></span>
        </div>
        <button onClick={handleImport} id="generate-schematic-from-beo-editor-btn" className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Items to Schematic</button>
      </div>
    </div>
  );
};

export default BEOImporter;
