        document.addEventListener('DOMContentLoaded', () => {
            const startScreen = document.getElementById('start-screen');
            const startBtn = document.getElementById('start-btn');
            const animationContainer = document.getElementById('animation-container');
            const music = document.getElementById('background-music');
            const waveAnimations = document.querySelectorAll('.wave-animation');

            startBtn.addEventListener('click', () => {
                // إخفاء شاشة البدء
                startScreen.style.opacity = '0';
                startScreen.style.pointerEvents = 'none';

                // إظهار حاوية الأنيميشن
                animationContainer.classList.remove('hidden');
                
                // إضافة كلاس لبدء كل الأنيميشن معًا
                document.body.classList.add('start-animation');
                
                // بدء أنيميشن الموجة يدويًا
                waveAnimations.forEach(anim => anim.beginElement());

                // تشغيل الموسيقى
                music.play().catch(error => {
                    console.log("Music playback was prevented by the browser. A user interaction is required.");
                });
                
                // بدء الألعاب النارية بعد 5 ثواني
                setTimeout(() => {
                    initFireworks();
                }, 5000);
            });

            // --- كود الألعاب النارية ---
            const canvas = document.getElementById('fireworks-canvas');
            const ctx = canvas.getContext('2d');
            let fireworks = [];
            let particles = [];
            let hue = 120; // Default color

            function setCanvasSize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            function random(min, max) { return Math.random() * (max - min) + min; }

            function Firework(sx, sy, tx, ty) {
                this.x = sx; this.y = sy;
                this.sx = sx; this.sy = sy;
                this.tx = tx; this.ty = ty;
                this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
                this.distanceTraveled = 0;
                this.coordinates = []; this.coordinateCount = 3;
                while (this.coordinateCount--) { this.coordinates.push([this.x, this.y]); }
                this.angle = Math.atan2(ty - sy, tx - sx);
                this.speed = 2; this.acceleration = 1.05;
                this.brightness = random(50, 70); this.targetRadius = 1;
            }

            Firework.prototype.update = function(index) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);
                if (this.targetRadius < 8) { this.targetRadius += 0.3; } else { this.targetRadius = 1; }
                this.speed *= this.acceleration;
                let vx = Math.cos(this.angle) * this.speed;
                let vy = Math.sin(this.angle) * this.speed;
                this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.sx, 2) + Math.pow(this.y - this.sy, 2));
                if (this.distanceTraveled >= this.distanceToTarget) {
                    createParticles(this.tx, this.ty);
                    fireworks.splice(index, 1);
                } else { this.x += vx; this.y += vy; }
            };

            Firework.prototype.draw = function() {
                ctx.beginPath();
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
                ctx.stroke();
            };

            function Particle(x, y) {
                this.x = x; this.y = y;
                this.coordinates = []; this.coordinateCount = 5;
                while (this.coordinateCount--) { this.coordinates.push([this.x, this.y]); }
                this.angle = random(0, Math.PI * 2);
                this.speed = random(1, 10);
                this.friction = 0.95; this.gravity = 1;
                this.hue = random(hue - 20, hue + 20);
                this.brightness = random(50, 80);
                this.alpha = 1; this.decay = random(0.015, 0.03);
            }

            Particle.prototype.update = function(index) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);
                this.speed *= this.friction;
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed + this.gravity;
                this.alpha -= this.decay;
                if (this.alpha <= this.decay) { particles.splice(index, 1); }
            };

            Particle.prototype.draw = function() {
                ctx.beginPath();
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
                ctx.stroke();
            };

            function createParticles(x, y) {
                let particleCount = 80;
                while (particleCount--) { particles.push(new Particle(x, y)); }
            }

            function loop() {
                requestAnimationFrame(loop);
                hue += 0.5;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'lighter';
                let i = fireworks.length;
                while (i--) { fireworks[i].draw(); fireworks[i].update(i); }
                let j = particles.length;
                while (j--) { particles[j].draw(); particles[j].update(j); }
            }
            
            function initFireworks() {
                setCanvasSize();
                window.addEventListener('resize', setCanvasSize);
                loop();
                setInterval(() => {
                    for(let i = 0; i < 5; i++) {
                         fireworks.push(new Firework(random(0, canvas.width), canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
                    }
                }, 800);
            }
        });
