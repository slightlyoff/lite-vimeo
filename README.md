# \<lite-vimeo\>

> A web component that displays Vimeo embeds faster. Based on @slightlyoff's work, this extends the component to allow for custom image placeholders and unlisted videos.

This is basically a rebadge of Justin's component, but for Vimeo.

## Features

-   No dependencies; it's just a vanilla web component.
-   It's fast yo.
-   It's Shadow Dom encapsulated!
-   It's responsive 16:9
-   It's accessible via keyboard and will set ARIA via the `videotitle` attribute
-   It's locale ready; you can set the `videoplay` to have a properly locale based label
-   Set the `start` attribute to start at a particular place in a video
-   You can set `autoload` to use Intersection Observer to load the iframe when scrolled into view.
-   Loads placeholder image as WebP with a Jpeg fallback
-   Allows unlisted vimeo videos
-   Allows custom placeholder images

## Install

This web component is built with ES modules in mind and is
available on NPM:

Install code-block:

```sh
npm i @slightlyoff/lite-vimeo
# or
yarn add @slightlyoff/lite-vimeo
```

After install, import into your project:

```js
import '@slightlyoff/lite-vimeo';
```

## Install with CDN

If you want the paste-and-go version, you can simply load it via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@slightlyoff/lite-vimeo@0.1.1/lite-vimeo.js">
```

## Basic Usage

```html
<lite-vimeo videoid="364402896"></lite-vimeo>
<!-- or, for unlisted videos -->
<lite-vimeo videoid="364402896/8d5a941a12" unlisted></lite-vimeo>
```

## Add Video Title

```html
<lite-vimeo videoid="364402896" videotitle="This is a video title"></lite-vimeo>
```

## Change "Play" for Locale</h3>

```html
<lite-vimeo
	videoid="364402896"
	videoplay="Mire"
	videotitle="El vídeo más fantástico en tódo el mundo"
></lite-vimeo>
```

## Style It

Height and Width are responsive in the component.

```html
<style>
	.style-it {
		width: 400px;
		margin: auto;
	}
</style>
<div class="style-it">
	<lite-vimeo videoid="364402896"></lite-vimeo>
</div>
```

## AutoLoad with IntersectionObserver

Uses Intersection Observer if available to automatically load the Vimeo iframe when scrolled into view.

```html
<lite-vimeo videoid="364402896" autoload></lite-vimeo>
```

## Auto Play (requires AutoLoad)

```html
<lite-vimeo videoid="364402896" autoload autoplay></lite-vimeo>
```

## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

| Name         | Description                                                                 | Default |
| ------------ | --------------------------------------------------------------------------- | ------- |
| `videoid`    | The Vimeo videoid                                                           | ``      |
| `videotitle` | The title of the video                                                      | `Video` |
| `videoplay`  | The title of the play button (for translation)                              | `Play`  |
| `autoload`   | Use Intersection Observer to load iframe when scrolled into view            | `false` |
| `autoplay`   | Video attempts to play automatically if auto-load set and browser allows it | `false` |
| `start`      | Set the point at which the video should start, in seconds                   | `0`     |
| `unlisted`   | An attribute flag whose existence declares the videoid as unlisted          | (empty) |
