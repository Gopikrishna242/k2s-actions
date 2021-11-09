#!/bin/bash
knts wait --for=condition=Ready  $(knts get nodes --no-headers -oname)