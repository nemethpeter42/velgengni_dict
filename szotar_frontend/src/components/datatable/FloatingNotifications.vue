<template>
  <div 
    class="
      floating-notifications-container
    ">

  </div>
</template>

<script setup lang="ts">

/*
TODO implement it with ease-out effect
close it based on unique id, like noti-08
maybe you have to use reverse order
some help for coding:

const Default: DismissOptions = {
    transition: 'transition-opacity',
    duration: 300,
    timing: 'ease-out',
    onHide: () => {},
};

  hide() {
        this._targetEl.classList.add(
            this._options.transition,
            `duration-${this._options.duration}`,
            this._options.timing,
            'opacity-0'
        );
        setTimeout(() => {
            this._targetEl.classList.add('hidden');
        }, this._options.duration);

        // callback function
        this._options.onHide(this, this._targetEl);
    }
*/
</script>
