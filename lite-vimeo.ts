/**
 * The shadowDom / Intersection Observer version of Paul's concept:
 * https://github.com/paulirish/lite-youtube-embed
 *
 * A lightweight Vimeo embed. Still should feel the same to the user, just
 * MUCH faster to initialize and paint.
 */
export class LiteVimeoEmbed extends HTMLElement {
  shadowRoot!: ShadowRoot;
  private iframeLoaded = false;
  /**
   * The `div#frame` of the shadowDOM that the iframe will be inserted into
   */
  private domRefFrame!: HTMLDivElement;
  private domRefImg!: {
    fallback: HTMLImageElement;
    webp: HTMLSourceElement;
    jpeg: HTMLSourceElement;
  };
  private domRefPlayButton!: HTMLButtonElement;
  private hash: string | undefined = undefined;

  constructor() {
    super();
    this.setupDom();
  }

  static get observedAttributes(): string[] {
    return ['videoid'];
  }

  connectedCallback(): void {
    this.addEventListener('pointerover', LiteVimeoEmbed.warmConnections, {
      once: true,
    });

    this.addEventListener('click', () => this.addIframe());
  }

  get isUnlisted(): boolean {
    return this.hasAttribute('unlisted');
  }

  get videoId(): string {
    const videoId = this.getAttribute('videoid');
    if (!videoId) {
      return '';
    }
    if (this.isUnlisted) {
      const [vimeoId, privateHash] = videoId.split('/');
      this.hash = privateHash;
      return vimeoId;
    }
    return videoId;
  }

  set videoId(id: string) {
    this.setAttribute('videoid', id);
  }

  get videoTitle(): string {
    return this.getAttribute('videotitle') || 'Video';
  }

  set videoTitle(title: string) {
    this.setAttribute('videotitle', title);
  }

  get videoPlay(): string {
    return this.getAttribute('videoPlay') || 'Play';
  }

  set videoPlay(name: string) {
    this.setAttribute('videoPlay', name);
  }

  get videoStartAt(): string {
    return this.getAttribute('videoPlay') || '0s';
  }

  set videoStartAt(time: string) {
    this.setAttribute('videoPlay', time);
  }

  get autoLoad(): boolean {
    return this.hasAttribute('autoload');
  }

  set autoLoad(value: boolean) {
    if (value) {
      this.setAttribute('autoload', '');
    } else {
      this.removeAttribute('autoload');
    }
  }

  get autoPlay(): boolean {
    return this.hasAttribute('autoplay');
  }

  set autoPlay(value: boolean) {
    if (value) {
      this.setAttribute('autoplay', 'autoplay');
    } else {
      this.removeAttribute('autoplay');
    }
  }

  get bgVideo(): boolean {
    return this.hasAttribute('bgVideo');
  }

  set bgVideo(value: boolean) {
    if (value) {
      this.setAttribute('bgVideo', '');
    } else {
      this.removeAttribute('bgVideo');
    }
  }

  /**
   * Define our shadowDOM for the component
   */
  private setupDom(): void {
    const shadowDom = this.attachShadow({mode: 'open'});
    shadowDom.innerHTML = `
      <style>
        :host {
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          padding-bottom: calc(100% / (16 / 9));
        }

        #frame, #fallbackPlaceholder, iframe {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        #frame {
          cursor: pointer;
        }

       ${
         this.bgVideo
           ? ''
           : ` #fallbackPlaceholder {
		object-fit: cover;
	  }

	  #frame::before {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);
		background-position: top;
		background-repeat: repeat-x;
		height: 60px;
		padding-bottom: 50px;
		width: 100%;
		transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
		z-index: 1;
	  }
	  /* play button */
	  .lvo-playbtn {
		width: 70px;
		height: 46px;
		background-color: #212121;
		z-index: 1;
		opacity: 0.8;
		border-radius: 10%;
		transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
		border: 0;
	  }
	  #frame:hover .lvo-playbtn {
		background-color: rgb(98, 175, 237);
		opacity: 1;
	  }
	  /* play button triangle */
	  .lvo-playbtn:before {
		content: '';
		border-style: solid;
		border-width: 11px 0 11px 19px;
		border-color: transparent transparent transparent #fff;
	  }
	  .lvo-playbtn,
	  .lvo-playbtn:before {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0);
	  }

	  /* Post-click styles */
	  .lvo-activated {
		cursor: unset;
	  }

	  #frame.lvo-activated::before,
	  .lvo-activated .lvo-playbtn {
		display: none;
	  }`
       }
      </style>
      <div id="frame">
        ${
          this.bgVideo
            ? ''
            : `<picture>
		<source id="webpPlaceholder" type="image/webp">
		<source id="jpegPlaceholder" type="image/jpeg">
		<img id="fallbackPlaceholder"
			 referrerpolicy="origin"
			 width="1100"
			 height="619"
			 decoding="async"
			 loading="lazy">
	  </picture>
	  <button class="lvo-playbtn"></button>`
        }
      </div>
    `;
    this.domRefFrame = shadowDom.querySelector<HTMLDivElement>('#frame');
    this.domRefImg = {
      fallback: shadowDom.querySelector<HTMLImageElement>(
        '#fallbackPlaceholder',
      ),
      webp: shadowDom.querySelector<HTMLSourceElement>('#webpPlaceholder'),
      jpeg: shadowDom.querySelector<HTMLSourceElement>('#jpegPlaceholder'),
    };
    this.domRefPlayButton = shadowDom.querySelector<HTMLButtonElement>(
      '.lvo-playbtn',
    );
  }

  /**
   * Parse our attributes and fire up some placeholders
   */
  private setupComponent(): void {
    if (this.bgVideo) {
      LiteVimeoEmbed.warmConnections();
      this.addIframe();
      return;
    } else {
      this.initImagePlaceholder();

      this.domRefPlayButton.setAttribute(
        'aria-label',
        `${this.videoPlay}: ${this.videoTitle}`,
      );

      this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);

      if (this.autoLoad) {
        this.initIntersectionObserver();
      }
    }
  }

  /**
   * Lifecycle method that we use to listen for attribute changes to period
   * @param {*} name
   * @param {*} oldVal
   * @param {*} newVal
   */
  attributeChangedCallback(
    name: string,
    oldVal: unknown,
    newVal: unknown,
  ): void {
    switch (name) {
      case 'videoid': {
        if (oldVal !== newVal) {
          this.setupComponent();
          // if we have a previous iframe, remove it and the activated class
          if (this.domRefFrame.classList.contains('lvo-activated')) {
            this.domRefFrame.classList.remove('lvo-activated');
            this.shadowRoot?.querySelector('iframe').remove();
          }
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Inject the iframe into the component body
   */
  private addIframe(): void {
    if (!this.iframeLoaded) {
      const apValue = this.bgVideo
        ? this.getIFrameParams()
        : (this.autoLoad && this.autoPlay) || !this.autoLoad
        ? 'autoplay=1'
        : '';
      const url =
        `/video/${this.videoId}` +
        (this.isUnlisted
          ? `?h=${this.hash}&${apValue}&#t=${this.videoStartAt}`
          : `?${apValue}&#t=${this.videoStartAt}`);

      const srcUrl = new URL(url, 'https://player.vimeo.com/');

      const iframeHTML = `
		<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope" allowfullscreen ${
      this.bgVideo ? `autoplay="true" muted="true"` : ''
    } src="${srcUrl}"></iframe>`;
      this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
      this.domRefFrame.classList.add('lvo-activated');
      this.iframeLoaded = true;
    }
  }

  private getIFrameParams(): string {
    return `dnt=1&&controls=0&hd=1&autohide=1&loop=1&muted=1&autoplay=1`;
  }

  /**
   * Setup the placeholder image for the component
   */
  private async initImagePlaceholder(): Promise<any> {
    if (this.isUnlisted) {
      const videoUrl = `https://vimeo.com/${this.videoId}/${this.hash}`;
      const apiUrl = `https://vimeo.com/api/oembed.json?url=${videoUrl}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);
      const {thumbnail_url: thumbnailUrl} = data;
      const parts = thumbnailUrl.split('/');
      return parts[-1];
    }

    // TODO(slightlyoff): TODO: cache API responses

    // we don't know which image type to preload, so warm the connection
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://i.vimeocdn.com/');

    // const apiUrl = `https://vimeo.com/api/v2/video/${this.videoId}.json`;
    const apiUrl = `https://api.vimeo.com/videos/${this.videoId}/pictures`;

    // Now fetch the JSON that locates our placeholder from vimeo's JSON API
    const apiResponse = (await (await fetch(apiUrl)).json())[0];

    // Extract the image id, e.g. 819916979, from a URL like:
    // thumbnail_large: "https://i.vimeocdn.com/video/819916979_640.jpg"
    const tnLarge = apiResponse.thumbnail_large;
    const imgId = tnLarge.substr(tnLarge.lastIndexOf('/') + 1).split('_')[0];

    // const posterUrlWebp =
    //    `https://i.ytimg.com/vi_webp/${this.videoId}/hqdefault.webp`;
    const posterUrlWebp = `https://i.vimeocdn.com/video/${imgId}.webp?mw=1100&mh=619&q=70`;
    const posterUrlJpeg = `https://i.vimeocdn.com/video/${imgId}.jpg?mw=1100&mh=619&q=70`;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute(
      'aria-label',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
    this.domRefImg.fallback.setAttribute(
      'alt',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
  }

  /**
   * Setup the Intersection Observer to load the iframe when scrolled into view
   */
  private initIntersectionObserver(): void {
    if (
      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window
    ) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.iframeLoaded) {
            LiteVimeoEmbed.warmConnections();
            this.addIframe();
            observer.unobserve(this);
          }
        });
      }, options);

      observer.observe(this);
    }
  }

  private static preconnected = false;

  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   * @param {*} kind
   * @param {*} url
   * @param {*} as
   */
  private static addPrefetch(kind: string, url: string, as?: string): void {
    const linkElem = document.createElement('link');
    linkElem.rel = kind;
    linkElem.href = url;
    if (as) {
      linkElem.as = as;
    }
    linkElem.crossOrigin = 'true';
    document.head.append(linkElem);
  }

  /**
   * Begin preconnecting to warm up the iframe load Since the embed's network
   * requests load within its iframe, preload/prefetch'ing them outside the
   * iframe will only cause double-downloads. So, the best we can do is warm up
   * a few connections to origins that are in the critical path.
   *
   * Maybe `<link rel=preload as=document>` would work, but it's unsupported:
   * http://crbug.com/593267 But TBH, I don't think it'll happen soon with Site
   * Isolation and split caches adding serious complexity.
   */
  private static warmConnections(): void {
    if (LiteVimeoEmbed.preconnected) return;
    // Host that Vimeo uses to serve JS needed by player
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://f.vimeocdn.com');

    // The iframe document comes from player.vimeo.com
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://player.vimeo.com');

    // Image for placeholder comes from i.vimeocdn.com
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://i.vimeocdn.com');

    LiteVimeoEmbed.preconnected = true;
  }
}
// Register custom element
customElements.define('lite-vimeo', LiteVimeoEmbed);

declare global {
  interface HTMLElementTagNameMap {
    'lite-vimeo': LiteVimeoEmbed;
  }
}
