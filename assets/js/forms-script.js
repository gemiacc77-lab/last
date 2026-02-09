function initializeFormHandlers(config) {
    const SCRIPT_URL = config.scriptUrl;
    let isFormSubmitted = false;
    const fileDataTransfer = new DataTransfer();
    function forceEnableSubmitButton() {
        const btn = document.getElementById('submitBriefButton');
        if (btn) {
            btn.disabled = false;
            btn.removeAttribute('disabled');
            btn.classList.remove('sending');
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            btn.textContent = 'Submit Full Brief';
        }
    }
    function setupSmartAutoSave() {
        try {
            const form = document.getElementById('projectBriefForm');
            if (!form) return;
            const storagePrefix = 'optiline_smart_' + window.location.pathname + '_';
            let statusDiv = document.getElementById('autosave-indicator');
            if (!statusDiv) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'autosave-indicator';
                statusDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: rgba(25, 25, 35, 0.95); color: #fff; padding: 10px 20px; border-radius: 50px; font-size: 12px; font-family: "Inter", sans-serif; opacity: 0; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 99999; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 10px; pointer-events: none;';
                statusDiv.innerHTML = '<div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981;"></div><span id="autosave-text" style="font-weight: 500; letter-spacing: 0.5px;">Draft Saved</span>';
                document.body.appendChild(statusDiv);
            }
            function showSavedStatus(type) {
                if (isFormSubmitted) return;
                const textSpan = statusDiv.querySelector('#autosave-text');
                const dot = statusDiv.querySelector('div');
                if (type === 'restored') {
                    dot.style.background = '#a855f7';
                    dot.style.boxShadow = '0 0 10px #a855f7';
                    textSpan.textContent = 'Data Restored';
                } else {
                    dot.style.background = '#10b981';
                    dot.style.boxShadow = '0 0 10px #10b981';
                    textSpan.textContent = 'Draft Saved';
                }
                statusDiv.style.opacity = '1';
                setTimeout(() => { 
                    statusDiv.style.opacity = '0';
                }, 2000);
            }
            const saveFieldImmediately = (input) => {
                if (isFormSubmitted) return;
                if (!input.name || input.type === 'file' || input.type === 'hidden') return;
                const key = storagePrefix + input.name;
                let valueToSave = input.value;
                if (input.type === 'checkbox') {
                    valueToSave = input.checked ? 'true' : '';
                } else if (input.type === 'radio') {
                    if (input.checked) valueToSave = input.value;
                    else return; 
                }
                localStorage.setItem(key, valueToSave);
            };
            const inputs = form.querySelectorAll('input:not([type="file"]):not([type="hidden"]), textarea, select');
            let dataRestored = false;
            inputs.forEach(input => {
                const key = storagePrefix + input.name;
                const savedValue = localStorage.getItem(key);
                if (savedValue !== null && savedValue !== undefined) {
                    if (input.type === 'checkbox') {
                        if (savedValue === 'true') {
                            input.checked = true;
                            dataRestored = true;
                        }
                    } else if (input.type === 'radio') {
                        if (input.value === savedValue) {
                            input.checked = true;
                            dataRestored = true;
                        }
                    } else if (input.value !== savedValue) {
                        input.value = savedValue;
                        dataRestored = true;
                    }
                    if (dataRestored && input.value) {
                        const formGroup = input.closest('.form-group');
                        if (formGroup) {
                            formGroup.classList.remove('error');
                            formGroup.classList.add('success');
                        }
                    }
                }
            });
            if (dataRestored) {
                showSavedStatus('restored');
            }
            let saveTimeout;
            const handleInput = function(e) {
                if (isFormSubmitted) return;
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveFieldImmediately(e.target);
                    showSavedStatus('saved');
                }, 500);
            };
            form.addEventListener('input', handleInput);
            form.addEventListener('change', (e) => {
                if (isFormSubmitted) return;
                saveFieldImmediately(e.target);
                showSavedStatus('saved');
            });
            window.addEventListener('beforeunload', () => {
                if (!isFormSubmitted) {
                    inputs.forEach(input => {
                        saveFieldImmediately(input);
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
    function clearSmartAutoSave() {
         const storagePrefix = 'optiline_smart_' + window.location.pathname + '_';
         Object.keys(localStorage).forEach(key => {
             if (key.startsWith(storagePrefix)) {
                 localStorage.removeItem(key);
             }
         });
         const statusDiv = document.getElementById('autosave-indicator');
         if(statusDiv) statusDiv.style.display = 'none';
    }
    (function populateHiddenFields() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const txId = urlParams.get('tx') || urlParams.get('txn_id');
            const paypalTxField = document.getElementById('paypalTxField');
            if (paypalTxField && txId) {
                paypalTxField.value = txId;
            } else {
                paypalTxField.value = "DIRECT_OR_NO_TX";
            }
            const marketerRef = localStorage.getItem('optiline_marketer_ref');
            if(marketerRef) document.getElementById('marketerField').value = marketerRef;
        } catch (e) {}
    })();
    document.addEventListener('DOMContentLoaded', function() {
        setupSmartAutoSave();
        const form = document.getElementById('projectBriefForm');
        if (form) {
            form.setAttribute('novalidate', 'true');
        }
        forceEnableSubmitButton();
        setTimeout(forceEnableSubmitButton, 1000);
        const formSections = document.querySelectorAll('.form-section');
        const progressSteps = document.querySelectorAll('.progress-step');
        const nextButtons = document.querySelectorAll('.btn-next');
        const prevButtons = document.querySelectorAll('.btn-prev');
        const submitButton = document.querySelector('.btn-submit'); 
        const realSubmitBtn = document.getElementById('submitBriefButton');
        if(realSubmitBtn) {
            realSubmitBtn.addEventListener('click', (e) => {
                if(fileDataTransfer.files.length === 0) {
                     e.preventDefault(); 
                     showNotification('Please upload your ZIP file before submitting.', 'error');
                     return;
                }
            });
            realSubmitBtn.addEventListener('mouseenter', forceEnableSubmitButton);
        }
        const formLoading = document.getElementById('formLoading');
        const uploadProgressContainer = document.getElementById('uploadProgressContainer');
        const uploadProgressFill = document.getElementById('uploadProgressFill');
        const uploadProgressText = document.getElementById('uploadProgressText');
        let currentSection = 0;
        setTimeout(() => {
            const briefForm = document.querySelector('.project-brief-form');
            if(briefForm) briefForm.classList.add('loaded');
        }, 500);
        updateFormDisplay();
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (!validateCurrentSection()) {
                    return;
                }
                markSectionAsCompleted(currentSection);
                const nextSection = parseInt(this.getAttribute('data-next'));
                navigateToSection(nextSection);
            });
        });
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const prevSection = parseInt(this.getAttribute('data-prev'));
                navigateToSection(prevSection);
            });
        });
        progressSteps.forEach(step => {
            step.addEventListener('click', function() {
                const targetSection = parseInt(this.getAttribute('data-step'));
                if (targetSection <= getLastCompletedSection()) {
                    navigateToSection(targetSection);
                } else {
                    showNotification('Please complete the current section before moving forward.', 'warning');
                }
            });
        });
        const fileUpload = document.getElementById('fileUpload');
        const filePreview = document.getElementById('filePreview');
        const fileUploadWrapper = document.getElementById('fileUploadWrapper');
        const fileValidationMessage = document.getElementById('fileValidationMessage');
        if (fileUploadWrapper) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileUploadWrapper.addEventListener(eventName, preventDefaults, false);
            });
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            ['dragenter', 'dragover'].forEach(eventName => {
                fileUploadWrapper.addEventListener(eventName, () => {
                    fileUploadWrapper.classList.add('dragover');
                }, false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                fileUploadWrapper.addEventListener(eventName, () => {
                    fileUploadWrapper.classList.remove('dragover');
                }, false);
            });
            fileUploadWrapper.addEventListener('drop', handleDrop, false);
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFiles(files);
            }
        }
        function handleFiles(files) {
            if (files.length === 0) return;
            if (files.length > 1) {
                showNotification('Please upload only one ZIP file.', 'error');
                return;
            }
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.zip')) {
                showNotification('Only ZIP files are allowed. Please select a ZIP file.', 'error');
                return;
            }
            const maxSize = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                showNotification(`File size (${(file.size/(1024*1024)).toFixed(2)}MB) exceeds maximum allowed size of 500MB.`, 'error');
                return;
            }
            fileDataTransfer.items.clear();
            fileDataTransfer.items.add(file);
            try {
                fileUpload.files = fileDataTransfer.files;
            } catch (e) {}
            showFilePreview(file);
            uploadProgressContainer.style.display = 'none';
            if (fileValidationMessage) {
                fileValidationMessage.classList.remove('show');
            }
            fileUploadWrapper.style.borderColor = '';
            forceEnableSubmitButton();
        }
        function showFilePreview(file) {
            filePreview.innerHTML = '';
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item zip-file';
            fileItem.id = 'zip-file-item';
            const fileSizeMB = (file.size/(1024*1024)).toFixed(2);
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas fa-file-archive"></i>
                </div>
                <div class="file-details">
                    <span class="file-name" title="${file.name}">${file.name}</span>
                    <div class="file-size-info">Size: ${fileSizeMB} MB</div>
                    <div class="file-progress-container">
                        <div class="file-progress-bar" id="zip-progress-bar"></div>
                    </div>
                </div>
                <div class="file-status-icon">
                    <i class="fas fa-check-circle checkmark" id="zip-checkmark"></i>
                </div>
                <button type="button" class="btn-remove-file" onclick="removeZipFile()" aria-label="Remove File">
                    <i class="fas fa-times"></i>
                </button>
            `;
            filePreview.appendChild(fileItem);
            simulateZipUpload();
        }
        window.removeZipFile = function() {
            const zipFileItem = document.getElementById('zip-file-item');
            if (zipFileItem) {
                gsap.to(zipFileItem, {
                    opacity: 0,
                    x: 50,
                    duration: 0.3,
                    onComplete: () => {
                        zipFileItem.remove();
                        fileDataTransfer.items.clear();
                        try {
                            fileUpload.files = fileDataTransfer.files;
                        } catch (e) {}
                        uploadProgressContainer.style.display = 'none';
                    }
                });
            }
        };
        function simulateZipUpload() {
            const progressBar = document.getElementById('zip-progress-bar');
            const checkmark = document.getElementById('zip-checkmark');
            const fileItem = document.getElementById('zip-file-item');
            let width = 0;
            const speed = Math.random() * 20 + 10;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    if (checkmark) checkmark.classList.add('visible');
                    if (fileItem) fileItem.classList.add('uploaded');
                    forceEnableSubmitButton();
                } else {
                    width += 2;
                    if (progressBar) progressBar.style.width = width + '%';
                }
            }, speed);
        }
        if (fileUpload) {
            fileUpload.addEventListener('change', function() {
                handleFiles(this.files);
            });
        }
       function navigateToSection(sectionIndex) {
            currentSection = sectionIndex;
            updateFormDisplay();
            setTimeout(() => {
                const targetTitle = document.getElementById('step-title-' + currentSection);
                if (targetTitle) {
                    targetTitle.style.scrollMarginTop = "140px"; 
                    targetTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 200);
            if (currentSection === 4 || currentSection === formSections.length - 1) {
                forceEnableSubmitButton();
            }
        }
        function updateFormDisplay() {
            formSections.forEach((section, index) => {
                section.classList.toggle('active', index === currentSection);
            });
            progressSteps.forEach((step, index) => {
                const isCompleted = index < currentSection || (index === currentSection && isSectionCompleted(index));
                step.classList.toggle('active', index === currentSection);
                step.classList.toggle('completed', isCompleted);
            });
            if (currentSection === formSections.length - 1) {
                if(submitButton) {
                    submitButton.style.display = 'block';
                    forceEnableSubmitButton();
                }
            } else {
                if(submitButton) submitButton.style.display = 'none';
            }
        }
        function markSectionAsCompleted(sectionIndex) {
            progressSteps[sectionIndex].classList.add('completed');
        }
        function validateCurrentSection() {
            const currentSectionElement = formSections[currentSection];
            let isValid = true;
            let firstInvalidField = null;
            const requiredInputs = currentSectionElement.querySelectorAll('input[required], textarea[required], select[required]');
            requiredInputs.forEach(input => {
                const formGroup = input.closest('.form-group');
                const validationMessage = formGroup.querySelector('.validation-message');
                let isInputValid = true;
                if (!input.value.trim()) {
                    isInputValid = false;
                }
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        isInputValid = false;
                        if (validationMessage) {
                            validationMessage.textContent = 'Please enter a valid email address';
                        }
                    }
                }
                if (!isInputValid) {
                    isValid = false;
                    formGroup.classList.add('error');
                    formGroup.classList.remove('success');
                    if (validationMessage && !validationMessage.textContent.includes('valid email')) {
                         validationMessage.textContent = 'This field is required';
                    }
                    if (validationMessage) validationMessage.className = 'validation-message error show';
                    gsap.to(input, {
                        x: -10,
                        duration: 0.1,
                        repeat: 3,
                        yoyo: true,
                        onComplete: () => gsap.set(input, { x: 0 })
                    });
                    if (!firstInvalidField) {
                        firstInvalidField = input;
                    }
                    input.addEventListener('input', function() {
                        this.style.borderColor = '';
                        formGroup.classList.remove('error');
                        if (validationMessage) {
                            validationMessage.classList.remove('show');
                        }
                    }, { once: true });
                } else {
                    formGroup.classList.remove('error');
                    formGroup.classList.add('success');
                    if (validationMessage) {
                        validationMessage.textContent = 'Looks good!';
                        validationMessage.className = 'validation-message success show';
                        setTimeout(() => {
                            validationMessage.classList.remove('show');
                        }, 2000);
                    }
                }
            });
            if (currentSection === 4 && fileDataTransfer.files.length === 0) {
                isValid = false;
                if (fileValidationMessage) {
                    fileValidationMessage.textContent = 'Please upload a ZIP file';
                    fileValidationMessage.className = 'validation-message error show';
                }
                fileUploadWrapper.style.borderColor = 'var(--error-color)';
                gsap.to(fileUploadWrapper, {
                    x: -10,
                    duration: 0.1,
                    repeat: 3,
                    yoyo: true,
                    onComplete: () => gsap.set(fileUploadWrapper, { x: 0 })
                });
            } else if (currentSection === 4 && fileDataTransfer.files.length > 0) {
                if (fileValidationMessage) {
                    fileValidationMessage.classList.remove('show');
                }
                fileUploadWrapper.style.borderColor = '';
            }
            if (!isValid && firstInvalidField) {
                firstInvalidField.focus();
                showNotification('Please fill in all required fields correctly.', 'error');
            }
            return isValid;
        }
        function getLastCompletedSection() {
            for (let i = formSections.length - 1; i >= 0; i--) {
                if (isSectionCompleted(i)) {
                    return i;
                }
            }
            return 0;
        }
        function isSectionCompleted(sectionIndex) {
            const sectionElement = formSections[sectionIndex];
            const requiredInputs = sectionElement.querySelectorAll('input[required], textarea[required], select[required]');
            for (let i = 0; i < requiredInputs.length; i++) {
                if (!requiredInputs[i].value.trim()) {
                    return false;
                }
                if (requiredInputs[i].type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(requiredInputs[i].value.trim())) {
                        return false;
                    }
                }
            }
            if (sectionIndex === 4 && fileDataTransfer.files.length === 0) {
                return false;
            }
            return true;
        }
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? 'var(--error-color)' : type === 'warning' ? '#f59e0b' : type === 'success' ? 'var(--success-color)' : 'var(--accent-purple)'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 400px;
                transform: translateX(150%);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-weight: 600;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            setTimeout(() => {
                notification.style.transform = 'translateX(150%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }
        async function uploadSingleFile(file) {
            return new Promise(async (resolve, reject) => {
                try {
                    const clientName = document.querySelector('input[name="fullName"]').value;
                    const brandName = document.querySelector('input[name="brandName"]').value;
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({
                            action: "getUploadUrl",
                            fileName: file.name,
                            mimeType: file.type,
                            fileSize: file.size,
                            clientName: clientName,
                            brandName: brandName
                        })
                    });
                    const data = await response.json();
                    if (data.status !== "success") {
                        throw new Error("Failed to get upload URL");
                    }
                    const uploadUrl = data.url;
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.upload.addEventListener('progress', (e) => {
                        const total = e.lengthComputable ? e.total : file.size;
                        if (total > 0) {
                            const percentComplete = (e.loaded / total) * 100;
                            updateUploadProgress(percentComplete);
                        }
                    });
                    xhr.addEventListener('load', () => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            updateUploadProgress(100);
                            resolve(`Uploaded: ${file.name}`);
                        } else {
                            reject(new Error(`Upload failed with status: ${xhr.status}`));
                        }
                    });
                    xhr.addEventListener('error', () => {
                        if (xhr.status === 0) {
                            updateUploadProgress(100);
                            resolve(`Uploaded (warn): ${file.name}`);
                        } else {
                            reject(new Error('Upload failed due to network error'));
                        }
                    });
                    xhr.open('PUT', uploadUrl);
                    xhr.setRequestHeader('Content-Type', file.type);
                    xhr.send(file);
                } catch (error) {
                    reject(error);
                }
            });
        }
        function updateUploadProgress(percent) {
            uploadProgressFill.style.width = percent + '%';
            uploadProgressText.textContent = Math.round(percent) + '%';
            if (percent === 100) {
                setTimeout(() => {
                    uploadProgressContainer.style.display = 'none';
                }, 1000);
            }
        }
        window.javascriptCallback = function(token) {
            forceEnableSubmitButton();
        }
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                formLoading.classList.add('active');
                if (fileDataTransfer.files.length === 0) {
                     formLoading.classList.remove('active');
                     showNotification('Please upload your ZIP file before submitting.', 'error');
                     if(fileValidationMessage) {
                         fileValidationMessage.textContent = 'ZIP file is required';
                         fileValidationMessage.className = 'validation-message error show';
                     }
                     if(fileUploadWrapper) {
                         fileUploadWrapper.style.borderColor = 'var(--error-color)';
                         gsap.to(fileUploadWrapper, { x: -10, duration: 0.1, repeat: 3, yoyo: true, onComplete: () => gsap.set(fileUploadWrapper, { x: 0 }) });
                     }
                     return;
                }
                let allSectionsValid = true;
                for (let i = 0; i < formSections.length; i++) {
                    const sectionElement = formSections[i];
                    const requiredInputs = sectionElement.querySelectorAll('input[required], textarea[required], select[required]');
                    for (let j = 0; j < requiredInputs.length; j++) {
                        if (!requiredInputs[j].value.trim()) {
                            allSectionsValid = false;
                        }
                        if (requiredInputs[j].type === 'email') {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(requiredInputs[j].value.trim())) {
                                allSectionsValid = false;
                            }
                        }
                    }
                }
                if (!allSectionsValid) {
                    formLoading.classList.remove('active');
                    showNotification(`Please review the form. Some required fields are missing.`, 'error');
                    for (let i = 0; i < formSections.length; i++) {
                        const sectionElement = formSections[i];
                        const requiredInputs = sectionElement.querySelectorAll('input[required], textarea[required], select[required]');
                        let sectionHasError = false;
                        for (let j = 0; j < requiredInputs.length; j++) {
                            if (!requiredInputs[j].value.trim()) {
                                sectionHasError = true;
                                break;
                            }
                            if (requiredInputs[j].type === 'email') {
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(requiredInputs[j].value.trim())) {
                                    sectionHasError = true;
                                    break;
                                }
                            }
                        }
                        if (sectionHasError) {
                            navigateToSection(i);
                            break;
                        }
                    }
                    return;
                }
                const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
                if (!turnstileResponse || !turnstileResponse.value) {
                    formLoading.classList.remove('active');
                    showNotification('Please check the security box (CAPTCHA) below.', 'error');
                    const turnstileContainer = document.querySelector('.cf-turnstile');
                    if(turnstileContainer) {
                         turnstileContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                         gsap.to(turnstileContainer, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
                    }
                    return;
                }
                const submitButton = document.getElementById('submitBriefButton');
                if(submitButton) {
                   submitButton.textContent = 'Uploading ZIP File...';
                   submitButton.classList.add('sending');
                   submitButton.disabled = true; 
                }
                try {
                    const files = fileDataTransfer.files;
                    let uploadedLinksLog = "";
                    if (files.length > 0) {
                        uploadProgressContainer.style.display = 'block';
                        updateUploadProgress(0);
                        showNotification(`Starting upload of ZIP file...`, 'info');
                        const file = files[0];
                        try {
                            const resultMsg = await uploadSingleFile(file);
                            uploadedLinksLog += resultMsg + "\n";
                            const fileItem = document.getElementById('zip-file-item');
                            if (fileItem) {
                                fileItem.style.background = 'transparent';
                            }
                        } catch (uploadErr) {
                            uploadedLinksLog += `Failed: ${file.name} - ${uploadErr.message}\n`;
                            const fileItem = document.getElementById('zip-file-item');
                            if (fileItem) {
                                fileItem.style.background = 'rgba(239, 68, 68, 0.1)';
                                fileItem.style.borderColor = 'var(--error-color)';
                            }
                            throw uploadErr;
                        }
                        showNotification(`ZIP file upload completed!`, 'success');
                    } else {
                        uploadedLinksLog = "No files selected.";
                    }
                    if(submitButton) submitButton.textContent = 'Sending Data...';
                    const formData = new FormData(form);
                    const dataObj = {};
                    formData.forEach((value, key) => dataObj[key] = value);
                    dataObj.fileLinks = uploadedLinksLog;
                    delete dataObj.attachments;
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify(dataObj)
                    });
                    const result = await response.json();
                    if (result.status === 'ok') {
                        isFormSubmitted = true;
                        clearSmartAutoSave();
                        formLoading.classList.remove('active');
                        form.style.display = 'none';
                        const successMsg = document.getElementById('successMessage');
                        successMsg.style.display = 'block';
                        gsap.to(window, {
                            duration: 1.5,
                            scrollTo: { 
                                y: successMsg,
                                offsetY: 100
                            },
                            ease: "power3.inOut"
                        });
                        gsap.fromTo(successMsg, 
                            {opacity: 0, scale: 0.8, rotationY: 90}, 
                            {opacity: 1, scale: 1, rotationY: 0, duration: 0.8, ease: "back.out(1.7)"}
                        );
                        createConfetti();
                    } else {
                        throw new Error(result.message || 'Unknown error.');
                    }
                } catch (err) {
                    formLoading.classList.remove('active');
                    showNotification('Submission error: ' + err.message, 'error');
                    if(submitButton) {
                        submitButton.textContent = 'Submit Full Brief';
                        submitButton.classList.remove('sending');
                        submitButton.disabled = false;
                        submitButton.removeAttribute('disabled');
                    }
                    uploadProgressContainer.style.display = 'none';
                }
            });
        }
        function createConfetti() {
            const colors = ['#8a2be2', '#a855f7', '#10b981', '#3b82f6', '#f59e0b'];
            for (let i = 0; i < 150; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    top: -20px;
                    left: ${Math.random() * 100}vw;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    opacity: ${Math.random() * 0.8 + 0.2};
                    z-index: 1000;
                `;
                document.body.appendChild(confetti);
                gsap.to(confetti, {
                    y: window.innerHeight + 20,
                    x: (Math.random() - 0.5) * 200,
                    rotation: Math.random() * 360,
                    duration: Math.random() * 3 + 2,
                    ease: "power2.out",
                    onComplete: () => {
                        if (confetti.parentNode) {
                            confetti.parentNode.removeChild(confetti);
                        }
                    }
                });
            }
        }
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const formGroup = this.closest('.form-group');
                const validationMessage = formGroup.querySelector('.validation-message');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (this.value && !emailRegex.test(this.value)) {
                    formGroup.classList.add('error');
                    formGroup.classList.remove('success');
                    if (validationMessage) {
                        validationMessage.textContent = 'Please enter a valid email address';
                        validationMessage.className = 'validation-message error show';
                    }
                } else if (this.value && emailRegex.test(this.value)) {
                    formGroup.classList.remove('error');
                    formGroup.classList.add('success');
                    if (validationMessage) {
                        validationMessage.textContent = 'Valid email address';
                        validationMessage.className = 'validation-message success show';
                        setTimeout(() => {
                            validationMessage.classList.remove('show');
                        }, 2000);
                    }
                }
            });
        }
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        const allInputs = document.querySelectorAll('input, textarea, select');
        allInputs.forEach(input => {
            input.addEventListener('focus', function() {
                const formGroup = this.closest('.form-group');
                formGroup.classList.add('focused');
            });
            input.addEventListener('blur', function() {
                const formGroup = this.closest('.form-group');
                formGroup.classList.remove('focused');
            });
        });
    });
}
