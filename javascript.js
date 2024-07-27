// bind querySelector
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'MAI TIEN MANH'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Sơn Tùng MTP',
            path: './assets/music/song1.mp3',
            image: './assets/img/img1.png'
        },
        {
            name: 'Thuyền không bến đợi',
            singer: 'Trung IU',
            path: './assets/music/song2.mp3',
            image: './assets/img/img2.jpg'
        },
        {
            name: 'Nổi gió lên',
            singer: 'Phan Như Thùy',
            path: './assets/music/song3.mp3',
            image: './assets/img/img3.jpg'
        },
        {
            name: 'Anh thôi nhân nhượng cover',
            singer: 'Thái Học',
            path: './assets/music/song4.mp3',
            image: './assets/img/img4.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join(' ');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            },
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xu ly phong to thu nho CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop - 16;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        }

        //Xu ly cd quay va dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' },
        ],
            {
                duration: 10000,
                iterations: Infinity,
            }
        )

        //Xu ly khi click vao button play/pause
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
                cdThumbAnimate.pause();

            }
            else {
                audio.play();
                cdThumbAnimate.play();

            }
        }

        //Khi bai hat duoc play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
        }

        //khi bai hat duoc pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');

        }

        //Khi tien do bai hat thay doi
        audio.ontimeupdate = function () {
            const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
            progress.value = progressPercent;
        }

        //Xu ly khi tua xong 
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime;
        }



        // Khi next bai hat
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.nextSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong();
        }

        // Khi prev bai hat
        prevBtn.onclick = function () {
            _this.prevSong();
            audio.play();
            _this.render()
            _this.scrollToActiveSong();

        }

        // Xu ly ran dom bat tat song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        //Xu ly next song sau khi ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            }
            else {
                nextBtn.click();
            }
        }

        // Khi repeat bai hat
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        //Lang nghe hanh vi playlist
        playlist.onclick = function (e) {
            const songNote = e.target.closest('.song:not(.active)')
            if (songNote || !e.target.closest('.option')) {
                //Xu ly khi click vao bai hat va thay doi bai hat
                if (songNote) {
                    _this.currentIndex = Number(songNote.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play();
                }


            }


        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex == this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView(
                {
                    behavior: 'smooth',
                    block: 'nearest',
                }
            )
        }, 300)
    },

    start: function () {
        //Gan cau hinh tu config vao app
        this.loadConfig();

        //Dinh nghia cac thuoc tinh cho onject
        this.defineProperties();

        // Lang nghe / xu ly cac su kien (DOM events)
        this.handleEvents();

        //Load du lieu song vao playlist
        this.loadCurrentSong();
        //Render lai playlist
        this.render();

        //Hien thi trang thai ban dau cua btn repeat
        repeatBtn.classList.toggle('active', this.isRepeat);
        //Hien thi trang thai ban dau cua btn random
        randomBtn.classList.toggle('active', this.isRandom);

    }

}
app.start();