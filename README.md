# \<lite-vimeo\>

> A web component that displays Vimeo embeds faster. Based on @slightlyoff's work (among others), this extends the component to allow for custom image placeholders and unlisted videos.

## Features

-   No dependencies; it's just vanilla JS & a web component.
-   It's fast 🏎️.
-   It's Shadow Dom encapsulated!
-   It's responsive 16:9
-   It's accessible via keyboard and will set ARIA via the `videotitle` attribute
-   It's locale ready; you can set the `videoplay` to have a properly locale based label
-   Set the `start` attribute to start at a particular place in a video
-   You can set `autoload` to use Intersection Observer to load the iframe when scrolled into view.
-   Loads placeholder image as WebP with a Jpeg fallback
-   Allows custom placeholder images
-   Allows unlisted vimeo videos

## Install

This web component is built with ES modules in mind and is
available on NPM:

Install code-block:

```sh
npm i @choctawnationofoklahoma/lite-vimeo
```

After install, import into your project:

```js
import '@choctawnationofoklahoma/lite-vimeo';
```

## Basic Examples

-   These have moved! See them at the [Github Wiki page](https://github.com/choctaw-nation/lite-vimeo/wiki/Basic-Examples).

## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

| Name                | Description                                                                 | Default  |
| ------------------- | --------------------------------------------------------------------------- | -------- |
| `videoid`\*         | The Vimeo videoid (required)                                                | ``       |
| `videotitle`        | The title of the video                                                      | `Video`  |
| `videoplay`         | The title of the play button (for translation)                              | `Play`   |
| `autoload`          | Use Intersection Observer to load iframe when scrolled into view            | `false`  |
| `autoplay`          | Video attempts to play automatically if auto-load set and browser allows it | `false`  |
| `start`             | Set the point at which the video should start, in seconds                   | `0`      |
| `unlisted`          | An attribute flag whose existence declares the videoid as unlisted          |          |
| `customPlaceholder` | A valid url to load a custom placeholder image                              | `string` |

---

## Contributing

1. Create a PR
2. Tag @kjroelke as a reviewer.

---

## Misc.

I also wrote a script to track videos views with Google Tag Manager. Since it's in the ShadowDOM, it gets a bit tricky, so [here's a link to that repo](https://github.com/choctaw-nation/gtm-lite-vimeo).
