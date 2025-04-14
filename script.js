// Utilisation de jsPDF et html2canvas depuis les CDN (inclus dans l'HTML)
const { jsPDF } = window.jspdf; // Correction : jsPDF est dans window.jspdf

document.addEventListener('DOMContentLoaded', () => {
    // --- Références aux éléments ---
    const form = document.getElementById('receipt-form');
    const previewContainer = document.getElementById('receipt-preview');

    // Formulaire
    const driverNameInput = document.getElementById('driver-name');
    const stationNoInput = document.getElementById('station-no');
    const immatNoInput = document.getElementById('immat-no');
    const communeInput = document.getElementById('commune');
    // **** INPUT REFS UPDATED ****
    const dateInput = document.getElementById('date'); // type="date"
    const departTimeInput = document.getElementById('depart-time'); // type="time"
    const arriveeTimeInput = document.getElementById('arrivee-time'); // type="time"
    const departLieuInput = document.getElementById('depart-lieu');
    const arriveeLieuInput = document.getElementById('arrivee-lieu');
    const priseChargeInput = document.getElementById('prise-charge');
    const sousTotalInput = document.getElementById('sous-total');
    const supplementTypeSelect = document.getElementById('supplement-type');
    const supplementLabelInput = document.getElementById('supplement-label');
    const supplementAmountInput = document.getElementById('supplement-amount');
    const tvaRateInput = document.getElementById('tva-rate');
    const clientNameInput = document.getElementById('client-name');
    const clientAddressInput = document.getElementById('client-address');
    const qrCodeUrlInput = document.getElementById('qr-code-url');
    const printWidthSelect = document.getElementById('print-width');
    const exportPdfButton = document.getElementById('export-pdf');
    const printReceiptButton = document.getElementById('print-receipt');

    // Prévisualisation (IDs inchangés)
    const previewDriverName = document.getElementById('preview-driver-name');
    const previewStationNo = document.getElementById('preview-station-no');
    const previewImmatNo = document.getElementById('preview-immat-no');
    const previewCommune = document.getElementById('preview-commune');
    const previewDate = document.getElementById('preview-date');
    const previewDepartTime = document.getElementById('preview-depart-time');
    const previewArriveeTime = document.getElementById('preview-arrivee-time');
    const previewDepartLieu = document.getElementById('preview-depart-lieu');
    const previewArriveeLieu = document.getElementById('preview-arrivee-lieu');
    const previewPriseCharge = document.getElementById('preview-prise-charge');
    const previewSousTotal = document.getElementById('preview-sous-total');
    const supplementLabelLine = document.getElementById('supplement-label-line');
    const supplementDetailLine = document.getElementById('supplement-detail-line');
    const previewSupplementType = document.getElementById('preview-supplement-type');
    const previewSupplementAmount = document.getElementById('preview-supplement-amount');
    const previewTotalTTC = document.getElementById('preview-total-ttc');
    const previewTvaRate = document.getElementById('preview-tva-rate');
    const previewTotalTVA = document.getElementById('preview-total-tva');
    const previewTotalHT = document.getElementById('preview-total-ht');
    const previewClientName = document.getElementById('preview-client-name');
    const previewClientAddress = document.getElementById('preview-client-address');
    const qrCodeCanvas = document.getElementById('qr-code-canvas');
    const qrCodeContainer = document.getElementById('qr-code-container');

    // --- QR Code Instance ---
    let qrCodeInstance = null;
    const namePlaceholderDots = '....................';
    const addressPlaceholderDots = '....................';
    const locationPlaceholderDots = '....................';

    // --- Fonction pour formater la date YYYY-MM-DD en DD/MM/YYYY ---
    function formatDate(dateString) {
        if (!dateString) return 'jj/mm/aaaa'; // Placeholder if empty
        try {
            const parts = dateString.split('-'); // YYYY-MM-DD
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
            }
            return dateString; // Return original if format is unexpected
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'erreur date';
        }
    }

    // --- Fonction de mise à jour de la prévisualisation ---
    function updatePreview() {
        // --- Mise à jour textes simples ---
        previewDriverName.textContent = driverNameInput.value.toUpperCase() || 'NOM CHAUFFEUR';
        previewStationNo.textContent = stationNoInput.value || '----';
        previewImmatNo.textContent = immatNoInput.value.toUpperCase() || 'AA-000-AA';
        previewCommune.textContent = communeInput.value.toUpperCase() || 'VILLE';

        // --- Date et Heures ---
        // **** UPDATED: Format date, read time directly ****
        previewDate.textContent = formatDate(dateInput.value); // Format YYYY-MM-DD -> DD/MM/YYYY
        previewDepartTime.textContent = departTimeInput.value || 'hh:mm'; // type="time" gives HH:MM
        previewArriveeTime.textContent = arriveeTimeInput.value || 'hh:mm'; // type="time" gives HH:MM

        // --- Lieux ---
        const departLieuValue = departLieuInput.value.trim();
        const arriveeLieuValue = arriveeLieuInput.value.trim();

        if(departLieuValue) {
            previewDepartLieu.textContent = departLieuValue;
            previewDepartLieu.classList.remove('placeholder');
        } else {
            previewDepartLieu.textContent = locationPlaceholderDots;
            previewDepartLieu.classList.add('placeholder');
        }
        if(arriveeLieuValue) {
             previewArriveeLieu.textContent = arriveeLieuValue;
             previewArriveeLieu.classList.remove('placeholder');
        } else {
             previewArriveeLieu.textContent = locationPlaceholderDots;
             previewArriveeLieu.classList.add('placeholder');
        }

        // --- Tarification ---
        const priseCharge = parseFloat(priseChargeInput.value) || 0;
        const sousTotalAvantSuppl = parseFloat(sousTotalInput.value) || 0;
        const supplementAmount = parseFloat(supplementAmountInput.value) || 0;
        const tvaRate = parseFloat(tvaRateInput.value) || 10;

        previewPriseCharge.textContent = priseCharge.toFixed(2);
        previewSousTotal.textContent = sousTotalAvantSuppl.toFixed(2);

        // --- Supplément ---
        const supplementType = supplementTypeSelect.value;
        let supplementTypeText = '';
        if (supplementType === 'Autre') {
            supplementTypeText = supplementLabelInput.value.trim() || 'Supplément'; // Trim whitespace
            supplementLabelInput.style.display = 'inline-block';
        } else {
             supplementTypeText = supplementType; // RESAIMMEDI, RESAAVANCE ou ""
             supplementLabelInput.style.display = 'none';
             supplementLabelInput.value = ''; // Clear if not 'Autre'
        }

        if (supplementType && supplementAmount > 0) {
            supplementLabelLine.style.display = 'flex';
            previewSupplementType.textContent = supplementTypeText;
            previewSupplementAmount.textContent = supplementAmount.toFixed(2);
            supplementDetailLine.style.display = 'flex';
        } else {
            supplementLabelLine.style.display = 'none';
            supplementDetailLine.style.display = 'none';
            previewSupplementType.textContent = '';
            previewSupplementAmount.textContent = '0.00';
        }

        // --- Calculs Totaux ---
        // **** Recalculated totalTTC based on actual supplement display logic ****
        const activeSupplementAmount = (supplementType && supplementAmount > 0) ? supplementAmount : 0;
        const totalTTC = sousTotalAvantSuppl + activeSupplementAmount;
        const totalHT = totalTTC / (1 + tvaRate / 100);
        const totalTVA = totalTTC - totalHT;

        previewTotalTTC.textContent = totalTTC.toFixed(2);
        previewTvaRate.textContent = tvaRate.toFixed(2);
        previewTotalTVA.textContent = totalTVA.toFixed(2);
        previewTotalHT.textContent = totalHT.toFixed(2);

        // --- Client Info ---
        const clientNameValue = clientNameInput.value.trim();
        const clientAddressValue = clientAddressInput.value.trim();

        if (clientNameValue) {
            previewClientName.textContent = clientNameValue;
            previewClientName.classList.remove('placeholder');
        } else {
            previewClientName.textContent = namePlaceholderDots;
            previewClientName.classList.add('placeholder');
        }

        if (clientAddressValue) {
            previewClientAddress.innerHTML = clientAddressValue.replace(/\n/g, '<br>');
            previewClientAddress.classList.remove('placeholder', 'address-placeholder');
        } else {
            previewClientAddress.innerHTML = addressPlaceholderDots;
            previewClientAddress.classList.add('placeholder', 'address-placeholder');
        }

        // --- QR Code ---
        const qrCodeUrl = qrCodeUrlInput.value.trim();
        if (qrCodeUrl) {
            qrCodeContainer.style.display = 'block';
            try {
                // Re-generate only if URL changes or instance doesn't exist
                 if (!qrCodeInstance || qrCodeInstance.value !== qrCodeUrl) {
                    // Clear previous QR if exists (optional, qrious might handle it)
                     if (qrCodeInstance) {
                         const ctx = qrCodeCanvas.getContext('2d');
                         if (ctx) ctx.clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
                     }
                    qrCodeInstance = new QRious({
                        element: qrCodeCanvas, value: qrCodeUrl, size: 80, level: 'H', padding: 4
                    });
                    qrCodeInstance.value = qrCodeUrl; // Store the value for comparison
                }
            } catch (e) {
                console.error("Erreur génération QR Code:", e);
                qrCodeContainer.style.display = 'none';
                qrCodeInstance = null;
            }
        } else {
            qrCodeContainer.style.display = 'none';
            if (qrCodeInstance) {
                 const ctx = qrCodeCanvas.getContext('2d');
                 if (ctx) ctx.clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
                 qrCodeInstance = null;
            }
        }

        // --- Ajustement largeur preview ---
        const selectedWidth = printWidthSelect.value || '58mm';
        previewContainer.className = `receipt receipt-${selectedWidth}`;

    } // --- Fin de updatePreview ---

    // --- Initialisation au chargement ---
    function initialize() {
        const today = new Date();

        // **** UPDATED: Set default values for date and time inputs ****
        if (!dateInput.value) {
            // Format YYYY-MM-DD for input type="date"
            dateInput.value = today.toISOString().split('T')[0];
        }
        if (!departTimeInput.value) {
            // Format HH:MM for input type="time"
            const hh = String(today.getHours()).padStart(2, '0');
            const min = String(today.getMinutes()).padStart(2, '0');
            departTimeInput.value = `${hh}:${min}`;
        }
        if (!arriveeTimeInput.value) {
            const arrivalTime = new Date(today.getTime() + 15 * 60000); // +15 min
            const arr_hh = String(arrivalTime.getHours()).padStart(2, '0');
            const arr_min = String(arrivalTime.getMinutes()).padStart(2, '0');
            arriveeTimeInput.value = `${arr_hh}:${arr_min}`;
        }

        updatePreview(); // Call once on load
    }

    initialize();


    // --- Ajout des écouteurs d'événements ---
    form.addEventListener('input', updatePreview); // Update preview on any form input change

    supplementTypeSelect.addEventListener('change', () => {
        supplementLabelInput.style.display = (supplementTypeSelect.value === 'Autre') ? 'inline-block' : 'none';
        // No need to call updatePreview here, 'input' event on form already handles it
    });

    // --- Bouton Exporter en PDF (Adapté 58mm + Font Fix) ---
    exportPdfButton.addEventListener('click', () => {
        const receiptElement = document.getElementById('receipt-preview');
        const selectedWidthMm = 58; // Forcé à 58mm
        // Use formatted date for filename if available, otherwise use timestamp
        const dateString = previewDate.textContent.includes('/') ? previewDate.textContent.replace(/\//g, '-') : Date.now();
        const filename = `ticket-taxi-${previewImmatNo.textContent}-${dateString}.pdf`;

        console.log("Exporting PDF...");

        // **** ADDED: Wait for fonts to be ready ****
        document.fonts.ready.then(() => {
            console.log("Fonts ready, generating canvas...");
            html2canvas(receiptElement, {
                 scale: 3, // Maintain good resolution
                 useCORS: true,
                 logging: true, // Enable logging for debugging
                 backgroundColor: '#ffffff',
                 width: receiptElement.offsetWidth,
                 height: receiptElement.offsetHeight,
                 // Attempt to ensure rendering completes
                 // onrendered: (canvas) => { ... } // Deprecated, use promise .then()
            }).then(canvas => {
                console.log("Canvas generated, creating PDF...");
                const imgData = canvas.toDataURL('image/png');
                const imgProps = new Image();

                // Use onload to ensure image dimensions are available
                imgProps.onload = () => {
                    const pdfWidth = selectedWidthMm;
                    const imgWidth = imgProps.naturalWidth;
                    const imgHeight = imgProps.naturalHeight;
                    const pdfHeight = (imgHeight * pdfWidth) / imgWidth; // Calculate proportional height

                    console.log(`Image dimensions: ${imgWidth}x${imgHeight}, PDF dimensions: ${pdfWidth}x${pdfHeight}`);

                    // Create PDF with exact calculated dimensions
                    const pdf = new jsPDF({
                        orientation: 'p',
                        unit: 'mm',
                        format: [pdfWidth, pdfHeight] // Use calculated height, not fixed A4
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    console.log("PDF generated, saving...");
                    pdf.save(filename);
                };

                imgProps.onerror = (err) => {
                     console.error("Error loading image properties from data URL:", err);
                     alert("Erreur lors de la préparation de l'image pour le PDF. Vérifiez la console.");
                };

                // Set the source for the Image object to trigger onload
                imgProps.src = imgData;

            }).catch(err => {
                console.error("Erreur html2canvas:", err);
                alert("Impossible de générer l'image du ticket pour le PDF. Erreur: " + err.message + ". Vérifiez la console.");
            });
        }).catch(fontErr => {
             console.error("Erreur chargement police:", fontErr);
             alert("Impossible de garantir le chargement de la police avant l'export PDF. Le rendu peut être incorrect.");
             // Optionally, you could still attempt the html2canvas call here,
             // but it might not use the correct font.
        });
    });


    // --- Bouton Imprimer (Adapté 58mm) ---
    printReceiptButton.addEventListener('click', () => {
        const receiptElement = document.getElementById('receipt-preview');
        // Ensure correct class for @media print
        receiptElement.classList.remove('receipt-80mm');
        receiptElement.classList.add('receipt-58mm');

        console.log("Attempting to print...");
        window.print();
    });

}); // Fin de DOMContentLoaded