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
        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( 'Server is down' );
    } );

    test( 'query after poolClose', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        await oMysql.poolClose();

        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'chacho' )` );
        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( 'Server is down' );
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

        expect( result ).toBe( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toBe( "Error: Unknown column 'namee' in 'field list'" );
    } );

    test( 'query INSERT ok', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `INSERT INTO test_easy ( name ) VALUES ( 'chacho' )` );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result.constructor.name ).toBe( 'ResultArray' );
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
        let result = await oMysql.query( `INSERT INTO test_complex ( code, name ) VALUES ( 'chacho', 'loco' )`, 'id' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( 1 );
        expect( lastQuery.count ).toBe( 1 );
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

        expect( result.constructor.name ).toBe( 'ResultArray' );
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

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toBe( false );
        expect( lastQuery.status ).toBe( false );
        expect( lastQuery.error.msg ).toMatch( /(Error: You have an error in your SQL syntax;)/ );
    } );

    test( 'query SELECT ok', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy` );
        await oMysql.poolClose();

        expect( result.constructor.name ).toBe( 'ResultArray' );
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

    test( 'query SELECT ok get array', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        await oMysql.poolOpen();
        let result = await oMysql.query( `SELECT * FROM test_easy ORDER BY id ASC`, 'array' );
        await oMysql.poolClose();

        let lastQuery = oMysql.getLastQuery();

        expect( result ).toEqual( [ { 'id': 1, 'name': 'chacho' }, { 'id': 2, 'name': 'bar' }, { 'id': 4, 'name': 'tio' } ] );
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

        expect( result ).toEqual( { '1': { 'id': 1, 'name': 'chacho' }, '2': { 'id': 2, 'name': 'bar' }, '4': { 'id': 4, 'name': 'tio' } } );
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

        expect( result ).toEqual( { 'chacho': { 'id': 1, 'name': 'chacho' }, 'bar': { 'id': 2, 'name': 'bar' }, 'tio': { 'id': 4, 'name': 'tio' } } );
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

        expect( result ).toEqual( { 'id': 1, 'name': 'chacho' } );
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

        expect( result ).toEqual( { 'id': 4, 'name': 'tio' } );
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

        expect( result1 ).toEqual( { 'id': 5, 'name': '' } );
        expect( result2 ).toEqual( { 'id': 5 } );
    } );
});