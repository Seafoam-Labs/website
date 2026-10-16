---
title: RLPM version parsing and comparison
description: Epoch, version and release ordering in RLPM, including permissive metadata, large numeric components, and comparison limits.
sidebar:
  label: Version comparison
  order: 2
---

Package version ordering determines whether a candidate is newer, whether a dependency is satisfied, and how an upgrade or downgrade is planned. RLPM separates permissive comparison of package metadata from stricter construction of a version value.

## Epoch, version, and release

Native package versions commonly take the form `epoch:pkgver-pkgrel`. The epoch and release can be omitted. RLPM's raw comparison follows the pinned libalpm C-locale rules, including unusual but NUL-free strings found in metadata.

- An epoch is recognized when the string starts with digits followed by `:`. A missing epoch uses zero.
- Numeric runs are compared without conversion to a bounded integer. Very large epochs and numeric version components therefore do not overflow an integer parser.
- Package release is compared only when both strings contain one.
- Comparison is byte-oriented. Non-ASCII bytes act as separators; this is not locale-sensitive or natural-language sorting.

The release rule has an important consequence:

| Comparison          | Result                       |
| ------------------- | ---------------------------- |
| `1.0` and `1.0-1`   | Equal for version comparison |
| `1.0` and `1.0-2`   | Equal for version comparison |
| `1.0-1` and `1.0-2` | The first is older           |

Equality across values with and without a release is therefore not transitive. Callers should not use this comparison as a general equivalence relation for deduplicating arbitrary strings.

## Metadata parsing and validation

`Version.compareStrings` compares raw strings without requiring strict metadata construction. Package metadata uses `initRaw`, which owns a permissive NUL-free string. Dependency relations retain raw version constraints and use the same comparison routine.

`Version.init` and `validate` apply stronger structural checks. They reject empty required components and malformed epoch prefixes. They are not a complete validator for every rule of PKGBUILD's version grammar.

This distinction lets RLPM compare existing metadata without presenting every accepted string as a well-formed version for a newly authored package. A metadata parse alone also says nothing about archive authenticity; see [integrity and signatures](/shelly-alpm/docs/rlpm/verification/).

## Library ownership

`Version.init` and `initRaw` own one copy of the original string. Parsed components borrow slices from that allocation, except for the static default epoch. The epoch is represented as text, preserving leading zeros and avoiding numeric overflow.

Release the version once with `deinit`; do not free individual components or deinitialize shallow copies. `compareStrings` provides an allocation-free comparison when owned metadata is unnecessary. Comparison results retain the conventional values of less than, equal, and greater than.

## How comparison affects selection

Version ordering is one input to [dependency resolution](/shelly-alpm/docs/rlpm/resolution/). Repository priority, ignore rules, replacements, provisions, and transaction flags still determine whether a candidate is selected. A newer package in a lower-priority repository does not automatically win.

The version tests include fixed expectations recorded from a pinned CachyOS libalpm build, plus ownership and malformed-input cases. These comparisons are evidence for the covered cases, not proof that every possible input or transaction behaves identically to every pacman release.

See the [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/version-compatibility.md) for API examples, reference provenance, and the `test-version` target.
