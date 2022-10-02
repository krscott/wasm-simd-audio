/**
 * Untility functions for idempotent context and node constructors.
 */

declare global {
  interface Window {
    _audiovis_audioContext?: AudioContext;
    _audiovis_audioSourceNodes?: [
      HTMLAudioElement,
      MediaElementAudioSourceNode
    ][];
  }
}

export const getAudioContext = (): AudioContext | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (!window._audiovis_audioContext) {
    window._audiovis_audioContext = new AudioContext();
  }

  return window._audiovis_audioContext;
};

export const getAudioSourceNode = (
  audioElement: HTMLAudioElement
): MediaElementAudioSourceNode | undefined => {
  const audioContext = getAudioContext();

  if (typeof window === "undefined" || !audioContext) {
    return undefined;
  }
  if (!window._audiovis_audioSourceNodes) {
    window._audiovis_audioSourceNodes = [];
  }

  const existing = window._audiovis_audioSourceNodes.find(
    ([element]) => element === audioElement
  );

  if (existing) {
    const [, existingAudioNode] = existing;
    return existingAudioNode;
  }

  const audioNode = audioContext.createMediaElementSource(audioElement);

  window._audiovis_audioSourceNodes.push([audioElement, audioNode]);

  return audioNode;
};
