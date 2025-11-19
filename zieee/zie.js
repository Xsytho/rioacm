function _0x50f7(_0x8926ce,_0x46ee13){const _0x571cbd=_0x571c();return _0x50f7=function(_0x50f7d0,_0xa4eefb){_0x50f7d0=_0x50f7d0-0x11a;let _0xd93b43=_0x571cbd[_0x50f7d0];return _0xd93b43;},_0x50f7(_0x8926ce,_0x46ee13);}const _0x8c9434=_0x50f7;(function(_0x1bba3a,_0x3f280a){const _0x2f04e2=_0x50f7,_0x2b97cc=_0x1bba3a();while(!![]){try{const _0x4fa35c=-parseInt(_0x2f04e2(0x125))/0x1+parseInt(_0x2f04e2(0x11f))/0x2+parseInt(_0x2f04e2(0x122))/0x3+-parseInt(_0x2f04e2(0x11b))/0x4*(parseInt(_0x2f04e2(0x11d))/0x5)+-parseInt(_0x2f04e2(0x124))/0x6+parseInt(_0x2f04e2(0x126))/0x7*(-parseInt(_0x2f04e2(0x11c))/0x8)+parseInt(_0x2f04e2(0x120))/0x9;if(_0x4fa35c===_0x3f280a)break;else _0x2b97cc['push'](_0x2b97cc['shift']());}catch(_0x200c72){_0x2b97cc['push'](_0x2b97cc['shift']());}}}(_0x571c,0xba750));const firebaseConfig={'apiKey':_0x8c9434(0x121),'authDomain':'viewer-9bac0.firebaseapp.com','databaseURL':_0x8c9434(0x123),'projectId':'viewer-9bac0','storageBucket':'viewer-9bac0.firebasestorage.app','messagingSenderId':'55316062204','appId':_0x8c9434(0x11e),'measurementId':_0x8c9434(0x11a)};function _0x571c(){const _0x198cb3=['16bsLrrf','5xQKaSj','1:55316062204:web:c9e9f62375262b2c9c1c79','1864768hpqzua','4329729keeIoV','AIzaSyD9R2VRFvNsRva00YlOXeBwhe_K1ODAE8c','3037881xmteSc','https://viewer-9bac0-default-rtdb.firebaseio.com','6241590TbYSsK','518347yePRVf','58198HaLZHQ','G-94WYM6NMHM','348496MSkXji'];_0x571c=function(){return _0x198cb3;};return _0x571c();}

        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();

        function logFirebaseStatus() {
            console.log("Firebase initialized:", !!firebase.apps.length);
            console.log("Database reference:", database?.ref()?.toString());
        }

        function setupViewCounter(counterId) {
            const counterElement = document.getElementById(counterId);
            if (!counterElement) {
                console.error(`Element #${counterId} not found!`);
                return;
            }

            counterElement.textContent = "Loading...";
            const counterRef = database.ref(`viewCounters/${counterId}`);

            if (!sessionStorage.getItem(`counted_${counterId}`)) {
                counterRef.transaction(
                    (currentCount) => {
                        return (currentCount || 0) + 1;
                    },
                    (error, committed) => {
                        if (error) {
                            console.error(`Transaction failed for ${counterId}:`, error);
                        } else if (committed) {
                            sessionStorage.setItem(`counted_${counterId}`, "true");
                            console.log(`Counter ${counterId} incremented successfully`);
                        }
                    }
                );
            }

            counterRef.on(
                "value",
                (snapshot) => {
                    const count = snapshot.val();
                    counterElement.textContent = count?.toLocaleString() || "0";
                },
                (error) => {
                    console.error(`Listener error for ${counterId}:`, error);
                    counterElement.textContent = "Error";
                }
            );
        }

        document.addEventListener("DOMContentLoaded", () => {
            logFirebaseStatus();
            setupViewCounter("viewZie");
        });
        document.addEventListener("DOMContentLoaded", setupViewCounter);
        const userId = '1379294829577502904';
        let socket = null;
        let presenceData = null;
        let spotifyUpdateInterval = null;
        let musicControl;

        const bgVideo = document.getElementById('bgVideo');
        const bgMusic = document.getElementById('bgMusic');
        const musicControlBtn = document.getElementById('musicControl');
        const musicIcon = document.getElementById('musicIcon');

        function initMusicControl() {
            musicControlBtn.classList.add('playing');

            musicControlBtn.addEventListener('click', () => {
                if (bgMusic.muted) {
                    bgMusic.muted = false;
                    musicIcon.classList.remove('fa-volume-mute');
                    musicIcon.classList.add('fa-volume-up');
                    musicControlBtn.classList.add('playing');
                } else {
                    bgMusic.muted = true;
                    musicIcon.classList.remove('fa-volume-up');
                    musicIcon.classList.add('fa-volume-mute');
                    musicControlBtn.classList.remove('playing');
                }
            });
        }

        function initLanyard() {
            socket = new WebSocket('wss://api.lanyard.rest/socket');

            socket.onopen = () => {
                console.log('Connected to Lanyard API');
                socket.send(JSON.stringify({
                    op: 2,
                    d: {
                        subscribe_to_id: userId
                    }
                }));
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                        presenceData = data.d;
                        updatePresence();
                    }
                } catch (error) {
                    console.error('Error parsing Lanyard data:', error);
                }
            };

            socket.onclose = () => {
                console.log('Disconnected from Lanyard API');
                setTimeout(initLanyard, 5000);
            };

            socket.onerror = (error) => {
                console.error('Lanyard WebSocket error:', error);
            };
        }

        function updatePresence() {
            if (!presenceData) return;

            const avatarImg = document.getElementById('avatar');
            if (presenceData.discord_user) {
                let avatarUrl;
                if (presenceData.discord_user.avatar) {
                    avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${presenceData.discord_user.avatar}.webp?size=256`;
                } else {
                    const discriminator = presenceData.discord_user.discriminator;
                    const defaultAvatarNum = discriminator % 5;
                    avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
                }

                if (avatarImg.src !== avatarUrl) {
                    avatarImg.src = avatarUrl;
                    avatarImg.onerror = () => {
                        avatarImg.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                    };

                    updateFavicons(avatarUrl);
                }
            }
            const statusIndicator = document.getElementById('statusIndicator');
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator';
                statusIndicator.classList.add(presenceData.discord_status);
            }

            const spotifySection = document.getElementById('spotifySection');
            const hasSpotifyData = presenceData.listening_to_spotify && presenceData.spotify;

            if (hasSpotifyData) {
                spotifySection.classList.add('visible');
                document.getElementById('spotifyHeaderText').innerHTML = `Listening to Spotify 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 168 168" style="vertical-align: middle; margin-left: 5px;">
            <path fill="white" d="M84,0C37.7,0,0,37.7,0,84s37.7,84,84,84s84-37.7,84-84S130.3,0,84,0z M121.3,121.5c-1.5,2.5-4.7,3.3-7.2,1.9
            c-19.8-12.1-44.8-14.9-74.3-8.5c-2.8,0.6-5.6-1.2-6.3-4s1.2-5.6,4-6.3c32.6-7.1,61.1-4,83.6,9.6
            C121.9,116.2,122.8,119.1,121.3,121.5z M130.4,97.6c-1.8,2.9-5.6,3.8-8.5,2c-22.7-13.9-57.3-17.9-84.1-10.2
            c-3.2,0.9-6.5-0.9-7.4-4.1s0.9-6.5,4.1-7.4c30.9-8.6,70.5-4.1,97.5,11.3C131,91.1,132.2,94.8,130.4,97.6z M131.6,73.7
            c-27-16.4-71.9-17.9-97.7-10.2c-3.8,1.1-7.7-1-8.7-4.8c-1.1-3.8,1-7.7,4.8-8.7c29.4-8.6,79.7-6.8,111.6,12.1
            c3.3,2,4.3,6.3,2.3,9.6C141.9,74.8,135.3,75.9,131.6,73.7z"/>
        </svg>`;

                document.getElementById('song-title').textContent = presenceData.spotify.song;
                document.getElementById('artist').textContent = presenceData.spotify.artist;

                const albumArt = document.getElementById('album-art');
                if (presenceData.spotify.album_art_url) {
                    albumArt.src = presenceData.spotify.album_art_url;
                    albumArt.onerror = () => {
                        albumArt.src = '';
                    };
                    albumArt.classList.remove('loading');
                }

                startSpotifyProgressUpdates();
            } else {
                spotifySection.classList.remove('visible');

                if (spotifyUpdateInterval) {
                    clearInterval(spotifyUpdateInterval);
                    spotifyUpdateInterval = null;
                }

                document.getElementById('progress-bar').style.width = '0%';
                document.getElementById('current-time').textContent = '--:--';
                document.getElementById('duration').textContent = '--:--';
            }
        }

        document.getElementById('avatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';


        function fetchInitialAvatar() {
            fetch(`https://api.lanyard.rest/v1/users/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data && data.data.discord_user) {
                        updateAvatarFromData(data.data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching initial avatar:', error);
                });
        }

        function updateAvatarFromData(data) {
            const avatarImg = document.getElementById('avatar');
            let avatarUrl;

            if (data.discord_user) {
                if (data.discord_user.avatar) {
                    avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${data.discord_user.avatar}.webp?size=256`;
                } else {
                    const discriminator = data.discord_user.discriminator;
                    const defaultAvatarNum = discriminator % 5;
                    avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
                }

                avatarImg.src = avatarUrl;
                avatarImg.onerror = () => {
                    avatarImg.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                };

                updateFavicons(avatarUrl);
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            fetchInitialAvatar();
        });

        function startSpotifyProgressUpdates() {
            if (spotifyUpdateInterval) {
                clearInterval(spotifyUpdateInterval);
            }

            updateSpotifyProgress();

            spotifyUpdateInterval = setInterval(updateSpotifyProgress, 1000);
        }

        function updateSpotifyProgress() {
            if (!presenceData || !presenceData.listening_to_spotify || !presenceData.spotify) {
                return;
            }

            const startTime = presenceData.spotify.timestamps.start;
            const endTime = presenceData.spotify.timestamps.end;

            if (!startTime || !endTime || startTime >= endTime) {
                return;
            }

            const totalDuration = endTime - startTime;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

            document.getElementById('progress-bar').style.width = `${progress}%`;

            const durationMinutes = Math.floor(totalDuration / 60000);
            const durationSeconds = Math.floor((totalDuration % 60000) / 1000);
            document.getElementById('duration').textContent =
                `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

            const currentElapsed = Math.max(0, elapsed);
            const currentMinutes = Math.floor(currentElapsed / 60000);
            const currentSeconds = Math.floor((currentElapsed % 60000) / 1000);
            document.getElementById('current-time').textContent =
                `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
        }

        function initCustomCursor() {
            if (isTouchDevice()) return;

            const cursor = document.getElementById('cursor');

            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });

            const hoverElements = document.querySelectorAll('a, button, .avatar-container, .footer-icon');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.classList.add('hover');
                });
                el.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hover');
                });
            });
        }
        function typeDescriptionText() {
            const texts = [
                "TANGA KA BA?"
            ];
            const typingText = document.getElementById('typingText_description');
            let textIndex = 0;
            let charIndex = 0;
            let isDeleting = false;

            function type() {
                const currentText = texts[textIndex];

                if (isDeleting) {
                    typingText.textContent = currentText.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    typingText.textContent = currentText.substring(0, charIndex + 1);
                    charIndex++;
                }

                if (!isDeleting && charIndex === currentText.length) {
                    isDeleting = true;
                    setTimeout(type, 2000);
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    setTimeout(type, 500);
                } else {
                    const speed = isDeleting ? 50 : 150;
                    setTimeout(type, speed);
                }
            }

            setTimeout(type, 1000);
        }

        function initCopyUsername() {
            const avatarButton = document.getElementById('avatarButton');
            const tooltip = document.getElementById('tooltip');

            avatarButton.addEventListener('click', () => {
                navigator.clipboard.writeText('.')
                    .then(() => {
                        tooltip.classList.add('show');
                        setTimeout(() => {
                            tooltip.classList.remove('show');
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            });
        }

        function enterProfile() {
            document.getElementById('entryScreen').style.display = 'none';
            document.getElementById('mainContent').classList.add('visible');

            bgVideo.style.display = 'block';
            bgVideo.play().catch(e => console.log('Video play failed:', e));
            bgMusic.play().catch(e => console.log('Audio play failed:', e));

            initCustomCursor();
            typeDescriptionText();
            initCopyUsername();
            setupViewCounter();
            initLanyard();
            initMusicControl();
        }

        document.getElementById('entryScreen').addEventListener('click', enterProfile);

        function typeEntryText() {
            const entryText = document.getElementById('entryText');
            const fullText = "Click anywhere to enter...";
            let charIndex = 0;

            function type() {
                if (charIndex < fullText.length) {
                    entryText.textContent = fullText.substring(0, charIndex + 1);
                    charIndex++;
                    setTimeout(type, 100);
                }
            }

            setTimeout(type, 1);
        }

        window.addEventListener('load', typeEntryText);

        document.getElementById('backButton').addEventListener('click', function () {
            window.location.href = 'https://444exlusv.world/';
        });

        function updateAvatarDecoration() {
            fetch(`https://api.lanyard.rest/v1/users/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data) {
                        const avatarDecoration = document.getElementById('avatarDecoration');
                        if (data.data.discord_user && data.data.discord_user.avatar_decoration_data) {
                            const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${data.data.discord_user.avatar_decoration_data.asset}.png`;
                            avatarDecoration.style.backgroundImage = `url('${decorationUrl}')`;
                            avatarDecoration.style.display = 'block';
                            console.log('Avatar decoration updated:', decorationUrl);
                        } else {
                            avatarDecoration.style.display = 'none';
                            console.log('No avatar decoration found');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching avatar decoration:', error);
                });
        }

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'F12') {
                e.preventDefault();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
            }
            if (e.ctrlKey && e.key === 'U') {
                e.preventDefault();
            }
        });

        const disableDevtoolScript = document.createElement('script');
        disableDevtoolScript.src = 'https://cdn.jsdelivr.net/npm/disable-devtool@latest';
        disableDevtoolScript.setAttribute('disable-devtool-auto', '');
        disableDevtoolScript.onload = () => {
            if (window.DisableDevtool) {
                window.DisableDevtool({
                    disableMenu: true,
                    disableSelect: false,
                    disableCopy: false,
                    disableCut: false,
                    disablePaste: false,
                    clearLog: false,
                    detectors: ['f12', 'ctrlShiftI', 'ctrlShiftJ', 'ctrlShiftC', 'ctrlU'],
                    ondevtoolopen: () => {
                        console.warn('Developer tools detected.');
                    }
                });
            }
        };
        document.body.appendChild(disableDevtoolScript);


        function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '';
            }
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                goBack();
            }
        });

        function isTouchDevice() {
            return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
        }

        function handleCursorForTouchDevices() {
            if (isTouchDevice()) {
                const cursor = document.getElementById('cursor');
                if (cursor) {
                    cursor.style.display = 'none';
                }

                document.body.style.cursor = 'default';
                const allElements = document.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.cursor = 'default';
                });
            }
        }

        document.addEventListener('DOMContentLoaded', handleCursorForTouchDevices);

        function isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        function handleMobileBackground() {
            if (isMobileDevice()) {
                const bgVideo = document.getElementById('bgVideo');
                if (bgVideo) {
                    bgVideo.style.display = 'none';
                    bgVideo.pause();

                    document.body.style.background = "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)";
                }
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            handleMobileBackground();
        });

        function updateFavicons(avatarUrl) {
            const favicon = document.getElementById('favicon');
            const appleTouchIcon = document.getElementById('appleTouchIcon');

            favicon.href = avatarUrl;
            appleTouchIcon.href = avatarUrl;

            document.head.appendChild(favicon.cloneNode(true));
            document.head.appendChild(appleTouchIcon.cloneNode(true));
        }

        document.addEventListener('DOMContentLoaded', function () {
            const title = document.querySelector('title');
            const originalText = title.textContent;
            title.textContent = '';

            let i = 0;
            const typingEffect = setInterval(() => {
                if (i < originalText.length) {
                    title.textContent += originalText.charAt(i);
                    title.className = 'typing';
                    i++;
                } else {
                    clearInterval(typingEffect);
                    title.className = '';
                }
            }, 150);
        });