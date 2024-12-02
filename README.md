# ome-zarr-metadata

A typescript library for interacting with [OME-Zarr](https://ngff.openmicroscopy.org/latest/) metadata.

See [zarrita](https://zarrita.dev/) for a typescript library for interacting with [Zarr](https://zarr.dev/) data which may implement the OME-Zarr specification.

## Usage notes

In several places, this library distinguishes between the stored "raw" form of the metadata, as defined by the specification, and the "functional" form which is easier to work with in a valid way.

Broadly, interfaces with the suffix `Raw` describe the raw form,
and classes describe the functional form.
The classes implement `static fromRaw` and `toRaw` methods for deserialising from and serialising to the `JSON.parse` / `JSON.stringify`-able object forms.

## Development

This library is developed using [rslib](https://lib.rsbuild.dev/index).

### Setup

Install the dependencies:

```bash
pnpm install
```

### Get Started

Build the library:

```bash
pnpm build
```

Build the library in watch mode:

```bash
pnpm dev
```

## Contributions

At present, this library contains implementations for

- [ ] 0.5
  - [x] axes
  - [x] coordinateTransformations
  - [x] multiscales
  - [x] labels
  - [ ] plate
  - [ ] well
  - [ ] bioformats2raw.layout
  - [ ] omero
- [ ] 0.4
- [ ] 0.3
- [ ] 0.2
- [ ] 0.1

Contributions are welcome for other metadata items and versions.
