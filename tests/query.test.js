const Ofn = require( 'oro-functions' );
const { OMysql } = require( '../index' );

//

const CONFIG = Ofn.getFileJsonRecursivelySync( `${__dirname}/config.json` );

beforeAll(async () => {
    let oMysql = new OMysql( { settings: CONFIG } );
    await oMysql.poolOpen();
    await oMysql.query( "CREATE DATABASE IF NOT EXISTS test_oromysql" );
    await oMysql.query( "USE test_oromysql" );
    await oMysql.query(
        `CREATE TABLE IF NOT EXISTS test_easy ( \
                    id INT NOT NULL AUTO_INCREMENT, \
                    name VARCHAR (16) NOT NULL, \
                PRIMARY KEY ( id ), UNIQUE test_easy_name ( name ) ) ENGINE = InnoDB;` );
    await oMysql.query(
        `CREATE TABLE IF NOT EXISTS test_complex ( \
                    name VARCHAR (16) NOT NULL, \
                    code INT NOT NULL AUTO_INCREMENT, \
                PRIMARY KEY ( code, name ) ) ENGINE = InnoDB;` );
    await oMysql.poolClose();
});

afterAll(async () => {
    let oMysql = new OMysql( { settings: CONFIG } );
    await oMysql.poolOpen();
    await oMysql.query( "USE test_oromysql" );
    await oMysql.query( "DROP TABLE IF EXISTS test_easy" );
    await oMysql.query( "DROP TABLE IF EXISTS test_complex" );
    await oMysql.poolClose();
});

//

describe('query when pool not opened', () => {
    test( 'query before poolOpen', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'chacho' )` );

        expect( result.status ).toBe( false );
        expect( result.error.msg ).toBe( 'Server is down' );
    } );

    test( 'query after poolClose', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        await oMysql.poolClose();

        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'chacho' )` );

        expect( result.status ).toBe( false );
        expect( result.error.msg ).toBe( 'Server is down' );
    } );
});

describe('query INSERT', () => {
    test( 'query INSERT bad', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_easy ( namee ) VALUES ( 'chacho' )` );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result.status ).toBe( false );
        expect( result.error.msg ).toBe( "Error: Unknown column 'namee' in 'field list'" );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( "Error: Unknown column 'namee' in 'field list'" );
    } );

    test( 'query INSERT ok bool', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'chacho' )`, 'bool' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( true );
        expect( Ofn.type( lastQuery, true ) ).toBe( 'ResultArray' );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query INSERT ok get id', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'loco' )`, 'id' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( 2 );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query INSERT ko unique', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'chacho' )`, 'id' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( "Error: Duplicate entry 'chacho' for key 'test_easy_name'" );
    } );

    test( 'query INSERT ok get bool', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'tio' )`, 'bool' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( true );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query INSERT complex ok get id', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_complex ( name ) VALUES ( 'chacho' ), ( 'loco' )`, 'id' );
        let arr = await oMysql.query( `SELECT * FROM test_complex`, 'array' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery( 1 );

        expect( result ).toBe( 1 );
        expect( arr ).toEqual( [ { name: 'chacho', code: 1 }, { name: 'loco', code: 2 } ] );
        expect( lastQuery.count ).toBe( 2 );
        expect( lastQuery.status ).toBe( true );
    } );
});

describe('query UPDATE', () => {
    test( 'query UPDATE ok', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `UPDATE test_easy SET name = 'foo' WHERE id = 2` );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( Ofn.type( result, true ) ).toBe( 'ResultArray' );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query UPDATE ok get bool', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `UPDATE test_easy SET name = 'bar' WHERE name = 'fooo'`, 'bool' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( false );
        expect( lastQuery.count ).toBe( 0 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query UPDATE ok get bool', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `UPDATE test_easy SET name = 'bar' WHERE name = 'foo'`, 'bool' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( true );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );
});

describe('query SELECT', () => {
    test( 'query SELECT bad', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROMM test_easy` );
        await oMysql.poolClose();

        expect( Ofn.type( result, true ) ).toBe( 'ResultArray' );
        expect( result.status ).toBe( false );
        expect( result.error.msg ).toMatch( /(Error: You have an error in your SQL syntax;)/ );
    } );

    test( 'query SELECT ok', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy` );
        await oMysql.poolClose();

        expect( Ofn.type( result, true ) ).toBe( 'ResultArray' );
        expect( result.status ).toBe( true );
        expect( result.count ).toBe( 3 );
    } );

    test( 'query SELECT ok get bool', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT '' FROM test_easy`, 'bool' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( true );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get bad format', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy`, 'chacho' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( 'OMysql.query:format is not allowed: chacho' );
    } );

    test( 'query SELECT ok get count', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT '' FROM test_easy`, 'count' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( 3 );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get value default', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy WHERE name = 'chacho'`, 'value' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( 1 );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get value', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT name FROM test_easy WHERE id = 1`, 'value' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( 'chacho' );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get value column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy WHERE id = 1`, 'value', 'name' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( 'chacho' );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get value bad column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy WHERE id = 1`, 'value', 'chacho' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( undefined );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get values default', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'values' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [ 1, 2, 4 ] );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get values column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'values', 'name' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [ 'chacho', 'bar', 'tio' ] );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get values bad column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'values', 'chacho' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [ undefined, undefined, undefined ] );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get valuesById default', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy`, 'valuesById', 'name' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { '1': 'chacho', '2': 'bar', '4': 'tio' } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get valuesById column key', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy`, 'valuesById', 'id', 'name' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { 'chacho': 1, 'bar': 2, 'tio': 4 } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get valuesById bad column key', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy`, 'valuesById', 'chacho', 'name' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { 'chacho': undefined, 'bar': undefined, 'tio': undefined } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get valuesById column bad key', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy`, 'valuesById', 'id', 'chacho' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( {} );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get array', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'array' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [ { id: 1, name: 'chacho' }, { id: 2, name: 'bar' }, { id: 4, name: 'tio' } ] );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get arrayById default', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'arrayById' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { '1': { id: 1, name: 'chacho' }, '2': { id: 2, name: 'bar' }, '4': { id: 4, name: 'tio' } } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get arrayById column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'arrayById', 'name' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { 'chacho': { id: 1, name: 'chacho' }, 'bar': { id: 2, name: 'bar' }, 'tio': { id: 4, name: 'tio' } } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get arrayById bad column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'arrayById', 'chacho' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( {} );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get row', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'row' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { id: 1, name: 'chacho' } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get row 2', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'row', 2 );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { id: 4, name: 'tio' } );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get bad row 999', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'row', 999 );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( {} );
        expect( lastQuery.count ).toBe( 3 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get rowStrict', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        await oMysql.query( `INSERT INTO test_easy ( id, name ) VALUES ( 5, '' )` );
        let result1 = await oMysql.query( `SELECT * FROM test_easy WHERE id = 5`, 'row' );
        let result2 = await oMysql.query( `SELECT * FROM test_easy WHERE id = 5`, 'rowStrict' );
        await oMysql.poolClose();

        expect( result1 ).toEqual( { id: 5, name: '' } );
        expect( result2 ).toEqual( { id: 5 } );
    } );
});

describe('query SELECT with fnSanitize', () => {
    test( 'query SELECT ok bad fnSanitize', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT '' FROM test_easy`, 'bool', 0, 0, 'chacho' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( 'OMysql.query:fnSanitize must be a function, not a string.' );
    } );

    test( 'query INSERT ok get id', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `INSERT INTO test_easy ( name ) VALUES ( 'foo' )`, 'id', 0, 0,
            value => ({ rowId: value })
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { rowId: 6 } );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get bool', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT '' FROM test_easy`, 'bool', 0, 0,
            value => ({ isDone: value })
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { isDone: true } );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get count', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT '' FROM test_easy`, 'count', 0, 0,
            value => ({ total: value })
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { total: 5 } );
        expect( lastQuery.count ).toBe( 5 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get value', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT * FROM test_easy WHERE name = 'chacho'`, 'value', 'name', 0,
            value => ({ value })
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { value: 'chacho' } );
        expect( lastQuery.count ).toBe( 1 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get values', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT * FROM test_easy ORDER BY id ASC`, 'values', 'name', 0,
            value => ! value ? null : `name: ${value}`
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [ 'name: chacho', 'name: bar', 'name: tio', null, 'name: foo' ] );
        expect( lastQuery.count ).toBe( 5 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get valuesById column key', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT * FROM test_easy`, 'valuesById', 'id', 'name',
            value => ({ id: value })
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { 'chacho': { id: 1 }, 'bar': { id: 2 }, 'tio': { id: 4 }, '': { id: 5 }, 'foo': { id: 6 } } );
        expect( lastQuery.count ).toBe( 5 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get array', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT * FROM test_easy ORDER BY id ASC`, 'array', 0, 0,
            value => ! value ? 'default' : value
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [
            { id: 1, name: 'chacho' },
            { id: 2, name: 'bar' },
            { id: 4, name: 'tio' },
            { id: 5, name: 'default' },
            { id: 6, name: 'foo' },
        ] );
        expect( lastQuery.count ).toBe( 5 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get arrayById column', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT * FROM test_easy ORDER BY id ASC`, 'arrayById', 'name', 0,
            value => ! value ? 'default' : value
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( {
            'chacho': { id: 1, name: 'chacho'  },
            'bar'   : { id: 2, name: 'bar'     },
            'tio'   : { id: 4, name: 'tio'     },
            ''      : { id: 5, name: 'default' },
            'foo'   : { id: 6, name: 'foo'     }
        } );
        expect( lastQuery.count ).toBe( 5 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get row', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query(
            `SELECT * FROM test_easy ORDER BY id ASC`, 'row', 0, 0,
            value => value +''
        );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( { id: '1', name: 'chacho' } );
        expect( lastQuery.count ).toBe( 5 );
        expect( lastQuery.status ).toBe( true );
    } );

    test( 'query SELECT ok get rowStrict', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result2 = await oMysql.query(
            `SELECT * FROM test_easy WHERE id = 5`, 'rowStrict', 0, 0,
            value => value +''
        );
        await oMysql.poolClose();

        expect( result2 ).toEqual( { id: '5' } );
    } );
});