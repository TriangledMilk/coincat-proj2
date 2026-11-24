// Store the coin form element for reading and submitting its data.
const form = document.querySelector('#coin-form');
// Store the form's status text element so save and edit messages can be shown.
const formStatus = document.querySelector('#form-status');
// Store the collection status element for loading and error messages.
const coinStatus = document.querySelector('#coin-status');
// Store the container that holds all rendered coin items.
const coinItems = document.querySelector('#coin-items');
// Store the HTML template used to create a card for each coin.
const template = document.querySelector('#coin-item-template');
// Store the form submit button because its text and disabled state change.
const submitButton = form.querySelector('button[type="submit"]');
// Store all form fields that need validation and form-data access.
const fields = [...form.querySelectorAll('input, textarea, select')];
// Store the form heading so it can switch between add and edit modes.
const formHeading = document.querySelector('#form-heading');
// Store the form description so it can explain the active mode.
const formDescription = document.querySelector('#form-description');
// Store the cancel-edit button for returning to add mode.
const cancelEditButton = document.querySelector('#cancel-edit');
// Track the ID of the coin being edited, or null when adding.
let editingId = null;

// Define a function that validates one form field.
function validateField(field) {
  // Check text and textarea fields for whitespace-only values.
  if (field.type === 'text' || field.tagName === 'TEXTAREA') {
    // Set browser validation feedback for a missing or whitespace-only value.
    field.setCustomValidity(field.validity.valueMissing || field.value.trim() ? '' : 'Enter a value that is not just whitespace.');
  }
  // Ask the browser whether the field passes all its validation rules.
  const valid = field.checkValidity();
  // Find the field's error element and display an error or clear it.
  document.getElementById(`${field.id}-error`).textContent = valid ? '' : field.validationMessage;
  // Remove the invalid accessibility attribute when the field is valid.
  if (valid) field.removeAttribute('aria-invalid');
  // Otherwise mark the field as invalid for accessibility and styling.
  else field.setAttribute('aria-invalid', 'true');
  // Return the result so the submit handler knows whether to continue.
  return valid;
}

// Loop through every form field to attach live validation listeners.
for (const field of fields) {
  // Validate again whenever the user changes the field.
  field.addEventListener('input', () => validateField(field));
  // Validate once more when the user leaves the field.
  field.addEventListener('blur', () => validateField(field));
}

// Define a function that resets the form and returns to add mode.
function clearForm() {
  // Clear every form control back to its default value.
  form.reset();
  // Forget which coin was being edited.
  editingId = null;
  // Restore the add-coin form heading.
  formHeading.textContent = 'Add a coin';
  // Restore the add-coin form instructions.
  formDescription.textContent = 'Add a coin and its specifications to the shared collection.';
  // Restore the submit button label.
  submitButton.textContent = 'Add coin';
  // Hide the cancel-edit button because no edit is active.
  cancelEditButton.hidden = true;
  // Loop through the fields to remove old validation state.
  for (const field of fields) {
    // Remove the invalid accessibility attribute.
    field.removeAttribute('aria-invalid');
    // Clear any validation message for the field.
    document.getElementById(`${field.id}-error`).textContent = '';
  }
}

// Define a function that loads one coin's data into the form.
function startEdit(item) {
  // Remember the selected coin's database ID.
  editingId = item._id;
  // Fill the name field with the coin name.
  form.elements.name.value = item.name;
  // Fill the circulation or bullion dropdown.
  form.elements.circulation_or_bullion.value = item.circulation_or_bullion;
  // Fill the silver-content field.
  form.elements.Ag.value = item.Ag;
  // Fill the weight-in-grams field.
  form.elements.weight_g.value = item.weight_g;
  // Fill the weight-in-troy-ounces field.
  form.elements.weight_toz.value = item.weight_toz;
  // Fill the actual-silver-weight field.
  form.elements.ASW_toz.value = item.ASW_toz;
  // Fill the coin number field.
  form.elements.number.value = item.number;
  // Fill the production-run field.
  form.elements.production_run.value = item.production_run;
  // Fill the description textarea.
  form.elements.description.value = item.description;
  // Change the heading to indicate edit mode.
  formHeading.textContent = 'Edit coin';
  // Change the instructions to indicate edit mode.
  formDescription.textContent = 'Update this coin and save your changes.';
  // Change the submit button text to save changes.
  submitButton.textContent = 'Save changes';
  // Show the cancel-edit button.
  cancelEditButton.hidden = false;
  // Clear an old form status message.
  formStatus.textContent = '';
  // Move keyboard focus to the name field.
  form.elements.name.focus();
  // Scroll the form into view and animate the transition.
  document.querySelector('.panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Listen for a click on the cancel-edit button.
cancelEditButton.addEventListener('click', () => {
  // Reset the form and exit edit mode.
  clearForm();
  // Tell the user that the edit was canceled.
  formStatus.textContent = 'Edit canceled.';
});

// Define an asynchronous function that downloads and renders all coins.
async function loadItems() {
  // Show a loading message while the request is running.
  coinStatus.textContent = 'Loading coins…';
  // Catch network, HTTP, and parsing errors for the whole operation.
  try {
    // Request the coin list; fetch defaults to the GET HTTP method.
    const response = await fetch('/api/coin-items');
    // Throw an error if the server returns a non-success response.
    if (!response.ok) throw new Error('Unable to load coins. Please try again later.');
    // Parse the successful JSON response into a JavaScript array.
    const items = await response.json();
    // Create an off-page document fragment for efficient rendering.
    const fragment = document.createDocumentFragment();
    // Loop over every coin returned by the API.
    for (const item of items) {
      // Clone the coin card template for this item.
      const node = template.content.cloneNode(true);
      // Insert the coin name into the cloned card.
      node.querySelector('.coin-name').textContent = item.name;
      // Insert the circulation-or-bullion value into the card.
      node.querySelector('.coin-type').textContent = item.circulation_or_bullion;
      // Insert all silver weight and numbering details into the card.
      node.querySelector('.coin-specs').textContent =
        `Ag: ${item.Ag} · ${item.weight_g} g · ${item.weight_toz} troy oz · ${item.ASW_toz} ASW troy oz · Number: ${item.number}`;
      // Insert the production-run details into the card.
      node.querySelector('.coin-run').textContent = `Production run: ${item.production_run}`;
      // Insert the coin description into the card.
      node.querySelector('.coin-description').textContent = item.description;
      // Find the edit button in the cloned card.
      const editButton = node.querySelector('.edit-button');
      // Find the delete button in the cloned card.
      const deleteButton = node.querySelector('.delete-button');

      // Start edit mode using this coin when the edit button is clicked.
      editButton.addEventListener('click', () => startEdit(item));

      // Listen for a delete button click in the cloned card.
      deleteButton.addEventListener('click', async () => {
        // Ask for confirmation and stop if the user cancels.
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        // Disable the button to prevent multiple delete requests.
        deleteButton.disabled = true;
        // Catch errors from the delete request.
        try {
          // Send a DELETE request to the API using this coin's ID.
          const deleteResponse = await fetch(`/api/coin-items/${item._id}`, { method: 'DELETE' });
          // Throw an error if the server cannot delete the coin.
          if (!deleteResponse.ok) throw new Error('Unable to delete the coin. Please try again later.');
          // Reset the form if the deleted coin was being edited.
          if (editingId === item._id) clearForm();
          // Reload the list and show a refresh error if needed.
          if (!await loadItems()) formStatus.textContent = 'Coin deleted, but the collection could not be refreshed.';
        } catch (error) {
          // Show the server or fallback delete error message.
          formStatus.textContent = error.message || 'Unable to delete the coin. Please try again.';
        } finally {
          // Re-enable the delete button after the operation finishes.
          deleteButton.disabled = false;
        }
      });
      // Add the completed card to the off-page fragment.
      fragment.append(node);
    }
    // Replace the old cards with all newly created cards.
    coinItems.replaceChildren(fragment);
    // Display an empty message or clear the collection status.
    coinStatus.textContent = items.length ? '' : 'No coins yet. Add the first one above.';
    // Return true to indicate that the coin list loaded successfully.
    return true;
  } catch {
    // Show a loading failure message if the request or parsing fails.
    coinStatus.textContent = 'Unable to load coins. Please refresh the page to try again.';
    // Return false to indicate that the coin list did not load.
    return false;
  }
}

// Listen for form submission to create or update a coin.
form.addEventListener('submit', async (event) => {
  // Prevent the browser from navigating and sending a normal form request.
  event.preventDefault();
  // Clear any previous form status message.
  formStatus.textContent = '';
  // Validate every field and collect each validation result.
  const validity = fields.map(validateField);
  // Stop if at least one field is invalid.
  if (validity.includes(false)) {
    // Move focus to the first invalid field.
    fields[validity.indexOf(false)].focus();
    // Exit the submit handler without saving.
    return;
  }

  // Convert the form controls into a plain object of field names and values.
  const data = Object.fromEntries(new FormData(form));
  // Loop through all number inputs.
  for (const field of form.querySelectorAll('input[type="number"]')) {
    // Convert their submitted text values into JavaScript numbers.
    data[field.name] = Number(data[field.name]);
  }
  // Determine whether this submission should create or update a coin.
  const isEditing = editingId !== null;
  // Use the coin ID in the URL for updates; otherwise use the collection URL.
  const url = isEditing ? `/api/coin-items/${encodeURIComponent(editingId)}` : '/api/coin-items';
  // Disable the submit button so the request cannot be sent twice.
  submitButton.disabled = true;
  // Show a mode-specific saving message.
  formStatus.textContent = isEditing ? 'Updating coin…' : 'Saving coin…';
  // Catch errors from the API request and response handling.
  try {
    // Send JSON with POST for a new coin or PUT for an existing coin.
    const response = await fetch(url, {
      // Select the HTTP method based on whether edit mode is active.
      method: isEditing ? 'PUT' : 'POST',
      // Tell the server that the request body is JSON.
      headers: { 'Content-Type': 'application/json' },
      // Convert the form data object into a JSON request body.
      body: JSON.stringify(data)
    });
    // Handle unsuccessful create or update responses.
    if (!response.ok) {
      // Try to read a server-provided error message, or use an empty object.
      const body = await response.json().catch(() => ({}));
      // Throw the server error or a fallback message.
      throw new Error(body.error || 'Unable to save the coin. Please try again.');
    }
    // Reset the form and return to add mode after a successful save.
    clearForm();
    // Show a mode-specific success message.
    formStatus.textContent = isEditing ? 'Coin updated.' : 'Coin saved.';
    // Reload the cards and replace the success message if refreshing fails.
    if (!await loadItems()) formStatus.textContent = isEditing
      // Use an update-specific refresh warning in edit mode.
      ? 'Coin updated, but the collection could not be refreshed.'
      // Use a save-specific refresh warning in add mode.
      : 'Coin saved, but the collection could not be refreshed.';
  } catch (error) {
    // Show the server error or a fallback save error message.
    formStatus.textContent = error.message || 'Unable to save the coin. Please try again.';
  } finally {
    // Re-enable the submit button after success or failure.
    submitButton.disabled = false;
  }
});
// Load and render the coin list immediately when the page script starts.
loadItems();
