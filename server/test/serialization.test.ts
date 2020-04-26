import { serialization } from '../src/core/serialization';
import extract = serialization.extract;

class TestClassRaw {
    stringProperty = 'initial';
    numberProperty = 42;
    arrayProperty = [];
}

test('Extract raw class', async () => {
    const obj = extract(new TestClassRaw(), {
        arrayProperty: ['1', '2', '3'],
        numberProperty: '44',
        stringProperty: 15
    });

    expect(obj).toMatchObject(<TestClassRaw> {
        arrayProperty: ['1', '2', '3'],
        numberProperty: 44,
        stringProperty: '15'
    });

    expect(obj).toBeInstanceOf(TestClassRaw);
});
