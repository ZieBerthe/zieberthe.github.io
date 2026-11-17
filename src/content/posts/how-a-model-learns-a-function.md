---
title: 'How a model learns a function'
description: 'The intuition behind the animation on my homepage fitting a curve to points with gradient descent.'
date: 2026-07-02
tags: ['machine-learning', 'intuition']
---

Have you ever been in a situation where you want to fit a machine learning model on a time seirie with multi dimension without knowing what to do? One of the first thing that comes to the mind is maybe sampling them. But this comes with a lot of questions, like what can the sample rate be? Also from a regularly ( or even irregularly sampled) points, you have an infinite number of functions that can pass throught these points at the same exact sampled timestamps. 
## Points, and a curve that wants to fit them

We start with some data points. Each is a pair `(x, y)`. Our goal is to find a
function `f` such that `f(x)` is close to `y` for every point and ideally
generalises to inputs we haven't seen.

The model I use is a small **radial-basis-function** regressor: a weighted sum of
smooth "bumps" spread across the input range. By turning the weights up and down,
we can shape a surprisingly flexible curve.

## Learning = reducing error

To measure how wrong the curve is, we use the **mean squared error**:

```text
loss = average over points of (f(x) - y)²
```

Then we nudge each weight in the direction that reduces this error a little at a
time. That's **gradient descent**. Repeat thousands of times per second and the
curve appears to flow into place.
