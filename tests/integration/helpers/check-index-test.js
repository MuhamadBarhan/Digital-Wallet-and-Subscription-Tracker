import { module, test } from 'qunit';
import { setupRenderingTest } from 'assessment-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | check-index', function (hooks) {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test('it renders', async function (assert) {
    this.set('inputValue', '1234');

    await render(hbs`{{check-index this.inputValue}}`);

    assert.dom().hasText('1234');
  });
});
