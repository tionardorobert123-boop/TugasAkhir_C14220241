<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('rooms', function () {
    return true;
});