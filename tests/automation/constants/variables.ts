import { MediaType } from '../types/testing';

export const longText =
  // eslint-disable-next-line max-len
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis lacinia mi. Praesent fermentum vehicula rhoncus. Aliquam ac purus lobortis, convallis nisi quis, pulvinar elit. Nam commodo eros in molestie lobortis. Donec at mattis est. In tempor ex nec velit mattis, vitae feugiat augue maximus. Nullam risus libero, bibendum et enim et, viverra viverra est. Suspendisse potenti. Sed ut nibh in sem rhoncus suscipit. Etiam tristique leo sit amet ullamcorper dictum. Suspendisse sollicitudin, lectus et suscipit eleifend, libero dui ultricies neque, non elementum nulla orci bibendum lorem. Suspendisse potenti. Aenean a tellus imperdiet, iaculis metus quis, pretium diam. Nunc varius vitae enim vestibulum interdum. In hac habitasse platea dictumst. Donec auctor sem quis eleifend fermentum. Vestibulum neque nulla, maximus non arcu gravida, condimentum euismod turpis. Cras ac mattis orci. Quisque ac enim pharetra felis sodales eleifend. Aliquam erat volutpat. Donec sit amet mollis nibh, eget feugiat ipsum. Integer vestibulum purus ac suscipit egestas. Duis vitae aliquet ligula.';

export const mediaArray = [
  {
    mediaType: 'image',
    path: 'fixtures/test-image.png',
    attachmentType: 'media' as MediaType,
  },
  {
    mediaType: 'video',
    path: 'fixtures/test-video.mp4',
    attachmentType: 'media' as MediaType,
  },
  {
    mediaType: 'gif',
    path: 'fixtures/test-gif.gif',
    attachmentType: 'media' as MediaType,
  },
  {
    mediaType: 'document',
    path: 'fixtures/test-file.pdf',
    attachmentType: 'file' as MediaType,
  },
  {
    mediaType: 'voice',
    path: '',
    attachmentType: 'audio' as MediaType,
  },
];
